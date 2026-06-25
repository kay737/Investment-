import { useState, useEffect } from "react"

// 🔑 PUT YOUR FINNHUB API KEY HERE:
const API_KEY = "d8uopv9r01qrt65tdot0d8uopv9r01qrt65tdotg"

export default function Home() {
  const [cash, setCash] = useState(50000)
  const [holdings, setHoldings] = useState([
    { symbol: "AAPL", shares: 120, price: 178.50 },
    { symbol: "TSLA", shares: 45, price: 245.30 },
    { symbol: "VTI", shares: 310, price: 259.80 },
    { symbol: "BTC", shares: 0.42, price: 67200 }
  ])
  const [showTrade, setShowTrade] = useState(false)
  const [selectedStock, setSelectedStock] = useState(null)
  const [shares, setShares] = useState(1)
  const [loading, setLoading] = useState(true)
  const [livePrices, setLivePrices] = useState({})

  // 📈 FETCH LIVE PRICES
  useEffect(() => {
    const fetchPrices = async () => {
      const symbols = holdings.map(h => h.symbol)
      const prices = {}
      
      for (const symbol of symbols) {
        try {
          const response = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
          )
          const data = await response.json()
          if (data.c) {
            prices[symbol] = data.c
          }
        } catch (error) {
          console.log(`Could not fetch ${symbol}`)
        }
      }
      
      setLivePrices(prices)
      setLoading(false)
    }
    
    fetchPrices()
    // Refresh every 30 seconds
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  // Update holdings with live prices
  const updatedHoldings = holdings.map(h => ({
    ...h,
    price: livePrices[h.symbol] || h.price
  }))

  const totalValue = updatedHoldings.reduce((sum, h) => sum + (h.shares * h.price), 0)

  const handleTrade = (type) => {
    if (!selectedStock) return
    const cost = selectedStock.price * shares
    
    if (type === "BUY" && cost > cash) {
      alert("Not enough cash!")
      return
    }

    const updated = [...holdings]
    const index = updated.findIndex(h => h.symbol === selectedStock.symbol)
    
    if (type === "BUY") {
      if (index >= 0) {
        updated[index].shares += shares
      } else {
        updated.push({ ...selectedStock, shares: shares })
      }
      setCash(cash - cost)
    } else {
      if (index >= 0 && updated[index].shares >= shares) {
        updated[index].shares -= shares
        if (updated[index].shares === 0) updated.splice(index, 1)
        setCash(cash + cost)
      } else {
        alert("Not enough shares!")
        return
      }
    }
    
    setHoldings(updated)
    setShowTrade(false)
    setShares(1)
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🚀 InvestSmart</h1>
        {loading ? (
          <span style={styles.liveBadge}>⏳ Loading prices...</span>
        ) : (
          <span style={styles.liveBadge}>🟢 Live Prices</span>
        )}
      </div>
      <p style={styles.cash}>💰 Cash: ${cash.toLocaleString()}</p>
      
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.label}>Portfolio</div>
          <div style={styles.value}>${totalValue.toLocaleString()}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.label}>Holdings</div>
          <div style={styles.value}>{updatedHoldings.length}</div>
        </div>
      </div>

      <div style={styles.holdings}>
        <h3>📊 Your Stocks</h3>
        {updatedHoldings.length === 0 ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: "20px 0" }}>No stocks yet. Buy some!</p>
        ) : (
          updatedHoldings.map((h, i) => (
            <div key={i} style={styles.row}>
              <span><b>{h.symbol}</b></span>
              <span>{h.shares} shares</span>
              <span style={{ color: livePrices[h.symbol] ? "#4ade80" : "#94a3b8" }}>
                ${h.price.toFixed(2)}
                {livePrices[h.symbol] && <span style={{ fontSize: "0.7rem", marginLeft: "4px" }}>🔴</span>}
              </span>
              <span>${(h.shares * h.price).toLocaleString()}</span>
              <button onClick={() => { setSelectedStock({ ...h, price: h.price }); setShowTrade(true) }} style={styles.btn}>
                Trade
              </button>
            </div>
          ))
        )}
      </div>

      <button style={styles.tradeBtn} onClick={() => {
        setSelectedStock({ symbol: "AAPL", price: livePrices.AAPL || 178.50 })
        setShowTrade(true)
      }}>
        ➕ Trade New Stock
      </button>

      {showTrade && selectedStock && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{ marginBottom: "10px" }}>Trade {selectedStock.symbol}</h2>
            <p>Live Price: <span style={{ color: "#4ade80" }}>${selectedStock.price.toFixed(2)}</span></p>
            <input 
              type="number" 
              min="0.01"
              step="0.01"
              value={shares} 
              onChange={(e) => setShares(Math.max(0.01, parseFloat(e.target.value) || 0.01))} 
              style={styles.input} 
            />
            <p style={styles.total}>Total: ${(selectedStock.price * shares).toLocaleString()}</p>
            <button onClick={() => handleTrade("BUY")} style={styles.buyBtn}>✅ Buy</button>
            <button onClick={() => handleTrade("SELL")} style={styles.sellBtn}>❌ Sell</button>
            <button onClick={() => setShowTrade(false)} style={styles.cancelBtn}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    background: "#0b1120",
    color: "#e5e7eb",
    minHeight: "100vh",
    padding: "2rem",
    fontFamily: "system-ui, sans-serif"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px"
  },
  title: {
    fontSize: "2.5rem",
    background: "linear-gradient(135deg, #60a5fa, #fbbf24)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0
  },
  liveBadge: {
    background: "#1e293b",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    color: "#4ade80",
    border: "1px solid #4ade80"
  },
  cash: {
    color: "#94a3b8",
    fontSize: "1.2rem",
    margin: "10px 0 30px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginBottom: "30px"
  },
  card: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #334155"
  },
  label: {
    color: "#94a3b8"
  },
  value: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    marginTop: "5px"
  },
  holdings: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #334155",
    marginBottom: "20px"
  },
  row: {
    display: "grid",
    gridTemplateColumns: "60px 70px 80px 80px 55px",
    padding: "10px 0",
    borderBottom: "1px solid #334155",
    alignItems: "center",
    gap: "5px"
  },
  btn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem"
  },
  tradeBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    width: "100%"
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  modalContent: {
    background: "#1e293b",
    padding: "30px",
    borderRadius: "16px",
    maxWidth: "350px",
    width: "100%",
    border: "1px solid #334155"
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#0b1120",
    color: "white",
    margin: "10px 0",
    fontSize: "1rem"
  },
  total: {
    color: "#fbbf24",
    fontSize: "1.2rem",
    fontWeight: "bold",
    margin: "10px 0"
  },
  buyBtn: {
    width: "100%",
    padding: "10px",
    background: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    margin: "5px 0"
  },
  sellBtn: {
    width: "100%",
    padding: "10px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    margin: "5px 0"
  },
  cancelBtn: {
    width: "100%",
    padding: "10px",
    background: "#334155",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    margin: "5px 0"
  }
}
