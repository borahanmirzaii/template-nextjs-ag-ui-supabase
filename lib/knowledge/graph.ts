import { createClient } from '@/lib/supabase/server'

export interface GraphNode {
  id: string
  entityType: string
  entityValue: string
  properties: Record<string, any>
}

export interface GraphEdge {
  id: string
  sourceId: string
  targetId: string
  relationshipType: string
  strength: number
  metadata: Record<string, any>
}

export async function buildKnowledgeGraph(
  userId: string,
  fileId?: string
): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
  const supabase = await createClient()
  
  // Get analysis results for files
  let query = supabase
    .from('analysis')
    .select(`
      *,
      files!inner(user_id)
    `)
    .eq('files.user_id', userId)
    .eq('status', 'completed')

  if (fileId) {
    query = query.eq('file_id', fileId)
  }

  const { data: analyses, error } = await query

  if (error) throw error

  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const nodeMap = new Map<string, GraphNode>()

  // Extract entities and relationships from analysis results
  analyses?.forEach((analysis) => {
    const result = analysis.result as any
    
    // Process entities
    if (result.entities) {
      result.entities.forEach((entity: any) => {
        const key = `${entity.type}:${entity.name}`
        if (!nodeMap.has(key)) {
          const node: GraphNode = {
            id: key,
            entityType: entity.type,
            entityValue: entity.name,
            properties: {
              context: entity.context,
              fileId: analysis.file_id,
            },
          }
          nodes.push(node)
          nodeMap.set(key, node)
        }
      })
    }

    // Process relationships
    if (result.relationships) {
      result.relationships.forEach((rel: any) => {
        const sourceKey = rel.source
        const targetKey = rel.target
        
        if (nodeMap.has(sourceKey) && nodeMap.has(targetKey)) {
          edges.push({
            id: `${sourceKey}-${targetKey}-${rel.type}`,
            sourceId: sourceKey,
            targetId: targetKey,
            relationshipType: rel.type,
            strength: rel.strength || 0.5,
            metadata: {},
          })
        }
      })
    }
  })

  return { nodes, edges }
}

