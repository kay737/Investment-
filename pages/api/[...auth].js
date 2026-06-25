export default function handler(req, res) {
  if (req.method === 'POST') {
    const { action, email, password, name } = req.body
    
    // Get users from memory (in production, use a database)
    if (!global.users) global.users = []
    if (!global.sessions) global.sessions = {}
    
    if (action === 'register') {
      // Check if user exists
      const existing = global.users.find(u => u.email === email)
      if (existing) {
        return res.status(400).json({ error: 'User already exists' })
      }
      
      // Create user
      const user = {
        id: Date.now().toString(),
        email,
        password: password, // In production, hash this!
        name: name || email.split('@')[0],
        cash: 50000,
        holdings: [
          { symbol: "AAPL", shares: 120, price: 178.50 },
          { symbol: "TSLA", shares: 45, price: 245.30 },
          { symbol: "VTI", shares: 310, price: 259.80 },
          { symbol: "BTC", shares: 0.42, price: 67200 }
        ]
      }
      
      global.users.push(user)
      
      // Create session
      const token = Math.random().toString(36).substring(7)
      global.sessions[token] = user.id
      
      return res.status(200).json({ 
        success: true, 
        user: { id: user.id, name: user.name, email: user.email },
        token: token
      })
    }
    
    if (action === 'login') {
      const user = global.users.find(u => u.email === email && u.password === password)
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' })
      }
      
      const token = Math.random().toString(36).substring(7)
      global.sessions[token] = user.id
      
      return res.status(200).json({ 
        success: true, 
        user: { id: user.id, name: user.name, email: user.email },
        token: token
      })
    }
    
    if (action === 'logout') {
      const { token } = req.body
      if (token && global.sessions[token]) {
        delete global.sessions[token]
      }
      return res.status(200).json({ success: true })
    }
    
    if (action === 'me') {
      const { token } = req.body
      if (!token || !global.sessions[token]) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
      
      const user = global.users.find(u => u.id === global.sessions[token])
      if (!user) {
        return res.status(401).json({ error: 'User not found' })
      }
      
      return res.status(200).json({ 
        user: { id: user.id, name: user.name, email: user.email, cash: user.cash, holdings: user.holdings }
      })
    }
    
    if (action === 'update') {
      const { token, cash, holdings } = req.body
      if (!token || !global.sessions[token]) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
      
      const user = global.users.find(u => u.id === global.sessions[token])
      if (!user) {
        return res.status(401).json({ error: 'User not found' })
      }
      
      if (cash !== undefined) user.cash = cash
      if (holdings) user.holdings = holdings
      
      return res.status(200).json({ success: true })
    }
  }
  
  res.status(405).json({ error: 'Method not allowed' })
        }
