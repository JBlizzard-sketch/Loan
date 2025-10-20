import { useState, useEffect } from 'react'
import { Send, CheckCircle, AlertCircle, MessageSquare, Phone } from 'lucide-react'

export default function Messaging({ API_URL }) {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState(null)
  
  const [whatsappForm, setWhatsappForm] = useState({
    to_number: '',
    message_type: 'daily_summary',
    branch_name: ''
  })
  
  const [telegramForm, setTelegramForm] = useState({
    message_type: 'daily_summary',
    branch_name: ''
  })

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/messaging/status`)
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Error fetching status:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendWhatsAppMessage = async () => {
    setSending(true)
    setMessage(null)
    
    try {
      let endpoint = ''
      let body = {}
      
      switch (whatsappForm.message_type) {
        case 'daily_summary':
          endpoint = '/api/messaging/whatsapp/daily-summary'
          body = { to_number: whatsappForm.to_number }
          break
        case 'branch_performance':
          endpoint = '/api/messaging/whatsapp/branch-performance'
          body = { to_number: whatsappForm.to_number, branch_name: whatsappForm.branch_name }
          break
        case 'motivational':
          endpoint = '/api/messaging/whatsapp/motivational'
          body = { to_number: whatsappForm.to_number, branch_name: whatsappForm.branch_name }
          break
        default:
          throw new Error('Invalid message type')
      }
      
      const queryString = new URLSearchParams(body).toString()
      const response = await fetch(`${API_URL}${endpoint}?${queryString}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'WhatsApp message sent successfully!' })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.detail || 'Failed to send message' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error: ' + error.message })
    } finally {
      setSending(false)
    }
  }

  const sendTelegramMessage = async () => {
    setSending(true)
    setMessage(null)
    
    try {
      let endpoint = ''
      let body = {}
      
      switch (telegramForm.message_type) {
        case 'daily_summary':
          endpoint = '/api/messaging/telegram/daily-summary'
          break
        case 'branch_performance':
          endpoint = '/api/messaging/telegram/branch-performance'
          body = { branch_name: telegramForm.branch_name }
          break
        default:
          throw new Error('Invalid message type')
      }
      
      const queryString = new URLSearchParams(body).toString()
      const response = await fetch(`${API_URL}${endpoint}?${queryString}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Telegram message sent successfully!' })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.detail || 'Failed to send message' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error: ' + error.message })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {message && (
        <div className={`rounded-lg p-4 flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border-2 border-green-200 text-green-800' 
            : 'bg-red-50 border-2 border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-semibold">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <MessageSquare size={28} />
              WhatsApp Messaging
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {status?.whatsapp?.configured ? (
              <>
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle size={20} />
                    <span className="font-semibold">WhatsApp Connected</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Recipient Phone Number
                  </label>
                  <input
                    type="tel"
                    value={whatsappForm.to_number}
                    onChange={(e) => setWhatsappForm({...whatsappForm, to_number: e.target.value})}
                    placeholder="+254712345678"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message Type
                  </label>
                  <select
                    value={whatsappForm.message_type}
                    onChange={(e) => setWhatsappForm({...whatsappForm, message_type: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                  >
                    <option value="daily_summary">Daily Summary</option>
                    <option value="branch_performance">Branch Performance</option>
                    <option value="motivational">Motivational Message</option>
                  </select>
                </div>

                {(whatsappForm.message_type === 'branch_performance' || whatsappForm.message_type === 'motivational') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      value={whatsappForm.branch_name}
                      onChange={(e) => setWhatsappForm({...whatsappForm, branch_name: e.target.value})}
                      placeholder="Nairobi Central"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    />
                  </div>
                )}

                <button
                  onClick={sendWhatsAppMessage}
                  disabled={sending}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={20} />
                  Send WhatsApp Message
                </button>
              </>
            ) : (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
                <AlertCircle className="mx-auto mb-3 text-yellow-600" size={48} />
                <h3 className="font-bold text-yellow-900 mb-2">WhatsApp Not Configured</h3>
                <p className="text-sm text-yellow-800 mb-4">
                  Please configure Twilio credentials in Settings to enable WhatsApp messaging.
                </p>
                <a
                  href="/settings"
                  className="inline-block bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-all font-semibold"
                >
                  Go to Settings
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Phone size={28} />
              Telegram Messaging
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {status?.telegram?.configured ? (
              <>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <CheckCircle size={20} />
                    <span className="font-semibold">Telegram Connected</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message Type
                  </label>
                  <select
                    value={telegramForm.message_type}
                    onChange={(e) => setTelegramForm({...telegramForm, message_type: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="daily_summary">Daily Summary</option>
                    <option value="branch_performance">Branch Performance</option>
                  </select>
                </div>

                {telegramForm.message_type === 'branch_performance' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      value={telegramForm.branch_name}
                      onChange={(e) => setTelegramForm({...telegramForm, branch_name: e.target.value})}
                      placeholder="Nairobi Central"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}

                <button
                  onClick={sendTelegramMessage}
                  disabled={sending}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={20} />
                  Send Telegram Message
                </button>
              </>
            ) : (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
                <AlertCircle className="mx-auto mb-3 text-yellow-600" size={48} />
                <h3 className="font-bold text-yellow-900 mb-2">Telegram Not Configured</h3>
                <p className="text-sm text-yellow-800 mb-4">
                  Please configure Telegram bot credentials in Settings to enable messaging.
                </p>
                <a
                  href="/settings"
                  className="inline-block bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-all font-semibold"
                >
                  Go to Settings
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
            <MessageSquare size={20} />
            WhatsApp Features
          </h3>
          <ul className="space-y-2 text-sm text-green-800">
            {status?.whatsapp?.features?.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Phone size={20} />
            Telegram Features
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            {status?.telegram?.features?.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle size={16} className="text-blue-600 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
