import { FileParser } from '../file-parser'

describe('FileParser', () => {
  describe('parseText', () => {
    it('should parse plain text file', async () => {
      const blob = new Blob(['Hello World'], { type: 'text/plain' })
      const file = new File([blob], 'test.txt', { type: 'text/plain' })
      
      const result = await FileParser.parseFile(file)
      expect(result).toContain('Hello World')
    })

    it('should handle empty text file', async () => {
      const blob = new Blob([''], { type: 'text/plain' })
      const file = new File([blob], 'empty.txt', { type: 'text/plain' })
      
      const result = await FileParser.parseFile(file)
      expect(result).toBe('')
    })
  })

  describe('parseJSON', () => {
    it('should parse valid JSON', async () => {
      const json = { name: 'test', value: 123 }
      const blob = new Blob([JSON.stringify(json)], { type: 'application/json' })
      const file = new File([blob], 'test.json', { type: 'application/json' })
      
      const result = await FileParser.parseFile(file)
      expect(result).toContain('test')
    })
  })

  describe('parseFile', () => {
    it('should route to correct parser based on mime type', async () => {
      const blob = new Blob(['test'], { type: 'text/plain' })
      const file = new File([blob], 'test.txt', { type: 'text/plain' })
      
      const result = await FileParser.parseFile(file)
      expect(result).toBe('test')
    })

    it('should throw error for unsupported file type', async () => {
      const blob = new Blob([''], { type: 'unsupported/type' })
      const file = new File([blob], 'test.unknown', { type: 'unsupported/type' })
      
      await expect(FileParser.parseFile(file)).rejects.toThrow()
    })
  })
})

