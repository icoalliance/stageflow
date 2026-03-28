import { useState } from 'react'

export function useAIPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [loading, setLoading] = useState(false)

  async function fetchPrompt(context, type) {
    setLoading(true)
    setPrompt(null)
    try {
      const systemMsg = `You are a helpful assistant for a home staging business CRM called StageFlow. 
You give brief, practical follow-up suggestions for a home stager. 
Keep responses under 60 words. Always end with 2-4 short follow-up question chips (5 words max each) as a JSON array on the last line like: CHIPS:["chip 1","chip 2","chip 3"]`

      let userMsg = ''
      if (type === 'job') {
        userMsg = `A staging job was just saved. Here are the details: Address: ${context.address}, ${context.city}. Status: ${context.status}. Realtor: ${context.realtor}. Items: ${context.items?.join(', ') || 'none yet'}. Notes: ${context.notes || 'none'}. Give a helpful follow-up tip or question for this staging job.`
      } else if (type === 'realtor') {
        userMsg = `A realtor was added/updated: ${context.name} from ${context.agency}. Notes: ${context.notes || 'none'}. Give a tip for nurturing this realtor relationship.`
      } else if (type === 'invoice') {
        userMsg = `An invoice was created. Amount: $${context.amount}. Status: ${context.status}. Due: ${context.dueDate}. Realtor: ${context.realtor}. Give a brief note about this invoice and payment follow-up.`
      } else if (type === 'inventory') {
        userMsg = `Inventory item saved: ${context.name} (${context.category}). Qty: ${context.qty}. Condition: ${context.condition}. Give a short tip about managing or using this item.`
      }

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          system: systemMsg,
          messages: [{ role: 'user', content: userMsg }],
        }),
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      const chipsMatch = text.match(/CHIPS:(\[.*?\])/)
      const chips = chipsMatch ? JSON.parse(chipsMatch[1]) : []
      const mainText = text.replace(/CHIPS:.*$/, '').trim()
      setPrompt({ text: mainText, chips })
    } catch (e) {
      setPrompt({ text: 'Saved successfully! Check back here for AI-powered suggestions.', chips: [] })
    }
    setLoading(false)
  }

  return { prompt, loading, fetchPrompt, clearPrompt: () => setPrompt(null) }
}
