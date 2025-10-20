import { useState, useEffect } from 'react'
import { Save, Key, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function Settings({ API_URL }) {
  const [settings, setSettings] = useState({
    openai_api_key: '',
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_phone_number: '',
    telegram_bot_token: '',
    telegram_chat_id: ''
  })
  
  const [showKeys, setShowKeys] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [configured, setConfigured] = useState({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/settings/status`)
      if (response.ok) {
        const data = await response.json()
        setConfigured(data.configured)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const toggleShowKey = (field) => {
    setShowKeys(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    
    try {
      const response = await fetch(`${API_URL}/api/settings/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
        fetchSettings()
        // Clear the input fields after successful save
        setSettings({
          openai_api_key: '',
          twilio_account_sid: '',
          twilio_auth_token: '',
          twilio_phone_number: '',
          telegram_bot_token: '',
          telegram_chat_id: ''
        })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.detail || 'Failed to save settings' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error: ' + error.message })
    } finally {
      setSaving(false)
    }
  }

  const ConfigField = ({ label, field, placeholder, icon: Icon, type = "text" }) => {
    const isConfigured = configured[field]
    const inputType = showKeys[field] ? "text" : type
    
    return (
      <div className="space-y-2">
        <label className="flex items-center justify-between text-sm font-semibold text-gray-700">
          <span className="flex items-center gap-2">
            <Icon size={18} className="text-blue-600" />
            {label}
          </span>
          {isConfigured && (
            <span className="flex items-center gap-1 text-green-600 text-xs">
              <CheckCircle size={14} />
              Configured
            </span>
          )}
        </label>
        <div className="relative">
          <input
            type={inputType}
            value={settings[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            placeholder={isConfigured ? '••••••••••••••••' : placeholder}
            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          />
          {type === "password" && (
            <button
              type="button"
              onClick={() => toggleShowKey(field)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKeys[field] ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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

      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Lock size={32} />
          <h2 className="text-3xl font-bold">API Configuration</h2>
        </div>
        <p className="text-blue-100">Securely configure your API keys and credentials for AI, messaging, and automation services.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            OpenAI Configuration
          </h3>
          <p className="text-sm text-gray-600 mb-4">Enable AI-powered insights, predictions, and analytics</p>
          <ConfigField
            label="OpenAI API Key"
            field="openai_api_key"
            placeholder="sk-..."
            icon={Key}
            type="password"
          />
        </div>

        <hr className="border-gray-200" />

        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📱</span>
            Twilio / WhatsApp Configuration
          </h3>
          <p className="text-sm text-gray-600 mb-4">Enable WhatsApp messaging for notifications and reports</p>
          <div className="space-y-4">
            <ConfigField
              label="Account SID"
              field="twilio_account_sid"
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              icon={Key}
              type="password"
            />
            <ConfigField
              label="Auth Token"
              field="twilio_auth_token"
              placeholder="your-auth-token"
              icon={Lock}
              type="password"
            />
            <ConfigField
              label="Phone Number"
              field="twilio_phone_number"
              placeholder="+1234567890"
              icon={Key}
            />
          </div>
        </div>

        <hr className="border-gray-200" />

        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            Telegram Configuration
          </h3>
          <p className="text-sm text-gray-600 mb-4">Enable Telegram bot for automated messaging</p>
          <div className="space-y-4">
            <ConfigField
              label="Bot Token"
              field="telegram_bot_token"
              placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
              icon={Key}
              type="password"
            />
            <ConfigField
              label="Chat ID"
              field="telegram_chat_id"
              placeholder="-1001234567890"
              icon={Key}
            />
          </div>
        </div>

        <div className="pt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-bold text-lg flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h4 className="font-bold text-yellow-900 mb-2">Security Note</h4>
            <p className="text-sm text-yellow-800">
              Your API keys are encrypted and stored securely on the server. They are never exposed to the frontend after saving.
              Only update these fields if you want to change your credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
