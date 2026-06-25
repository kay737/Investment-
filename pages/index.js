import { useState, useEffect } from "react"

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
  const [tradeType, setTradeType] = useState("BUY")
  const [loading, setLoading] = useState(true)
  const [livePrices, setLivePrices] = useState({})

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
          if (data.c) prices[symbol] = data.c
        } catch (error) {}
      }
      setLivePrices(prices)
      setLoading(false)
    }
    fetchPrices()
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [])

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
        <h1 style={styles.logo}>📊 InvestSmart</h1>
        <div style={styles.headerRight}>
          <span style={styles.liveBadge}>● Live</span>
          <span style={styles.balance}>${cash.toLocaleString()}</span>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Portfolio</div>
          <div style={styles.statValue}>${totalValue.toLocaleString()}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Holdings</div>
          <div style={styles.statValue}>{updatedHoldings.length}</div>
        </div>
      </div>

      <div style={styles.tradePanel}>
        <h3 style={styles.tradeTitle}>📊 Your Stocks</h3>
        {updatedHoldings.map((h, i) => (
          <div key={i} style={styles.row}>
            <div style={styles.stockInfo}>
              <span style={styles.symbol}>{h.symbol}</span>
              <span style={styles.shares}>{h.shares} shares</span>
            </div>
            <div style={styles.stockPrice}>
              <span style={styles.price}>${h.price.toFixed(2)}</span>
              <span style={styles.value}>${(h.shares * h.price).toLocaleString()}</span>
            </div>
            <button 
              onClick={() => { setSelectedStock({ ...h, price: h.price }); setShowTrade(true) }} 
              style={styles.tradeBtn}
            >
              Trade
            </button>
          </div>
        ))}
        <button style={styles.addBtn} onClick={() => {
          setSelectedStock({ symbol: "AAPL", price: livePrices.AAPL || 178.50 })
          setShowTrade(true)
        }}>
          + Trade New Stock
        </button>
      </div>

      {showTrade && selectedStock && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2>Trade {selectedStock.symbol}</h2>
              <button onClick={() => setShowTrade(false)} style={styles.closeBtn}>✕</button>
            </div>
            <p style={styles.modalPrice}>Price: <span style={{ color: "#4ade80" }}>${selectedStock.price.toFixed(2)}</span></p>
            
            <div style={styles.modalButtons}>
              <button onClick={() => setTradeType("BUY")} style={{ ...styles.modalTypeBtn, ...(tradeType === "BUY" ? styles.buyActive : {}) }}>Buy</button>
              <button onClick={() => setTradeType("SELL")} style={{ ...styles.modalTypeBtn, ...(tradeType === "SELL" ? styles.sellActive : {}) }}>Sell</button>
            </div>

            <div style={styles.modalInput}>
              <label>Shares</label>
              <input 
                type="number" 
                min="0.01" 
                step="0.01"
                value={shares} 
                onChange={(e) => setShares(Math.max(0.01, parseFloat(e.target.value) || 0.01))} 
                style={styles.input} 
              />
            </div>

            <div style={styles.quickAmounts}>
              <button onClick={() => setShares(1)} style={styles.quickBtn}>1</button>
              <button onClick={() => setShares(5)} style={styles.quickBtn}>5</button>
              <button onClick={() => setShares(10)} style={styles.quickBtn}>10</button>
              <button onClick={() => setShares(25)} style={styles.quickBtn}>25</button>
            </div>

            <p style={styles.modalTotal}>Total: ${(selectedStock.price * shares).toLocaleString()}</p>

            <button 
              onClick={() => handleTrade(tradeType)} 
              style={{ ...styles.confirmBtn, ...(tradeType === "BUY" ? styles.confirmBuy : styles.confirmSell) }}
            >
              {tradeType === "BUY" ? "✅ Buy" : "❌ Sell"} {selectedStock.symbol}
            </button>
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
    padding: "16px",
    fontFamily: "system-ui, sans-serif",
    maxWidth: "500px",
    margin: "0 auto"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #1e293b",
    marginBottom: "16px"
  },
  logo: {
    fontSize: "1.5rem",
    background: "linear-gradient(135deg, #60a5fa, #fbbf24)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  liveBadge: {
    color: "#4ade80",
    fontSize: "0.8rem"
  },
  balance: {
    background: "#1e293b",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: "#fbbf24"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "16px"
  },
  statCard: {
    background: "#1e293b",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #334155"
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: "0.8rem"
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginTop: "4px"
  },
  tradePanel: {
    background: "#1e293b",
    borderRadius: "12px",
    padding: "16px",
    border: "1px solid #334155"
  },
  tradeTitle: {
    color: "#94a3b8",
    marginBottom: "12px",
    fontSize: "0.9rem"
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #334155"
  },
  stockInfo: {
    display: "flex",
    flexDirection: "column"
  },
  symbol: {
    fontWeight: "bold",
    fontSize: "1rem"
  },
  shares: {
    color: "#94a3b8",
    fontSize: "0.7rem"
  },
  stockPrice: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end"
  },
  price: {
    color: "#4ade80",
    fontSize: "0.9rem"
  },
  value: {
    color: "#94a3b8",
    fontSize: "0.7rem"
  },
  tradeBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "4px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem"
  },
  addBtn: {
    width: "100%",
    padding: "10px",
    background: "transparent",
    border: "1px dashed #3b82f6",
    borderRadius: "8px",
    color: "#3b82f6",
    cursor: "pointer",
    marginTop: "8px",
    fontSize: "0.9rem"
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
    zIndex: 1000,
    padding: "16px"
  },
  modalContent: {
    background: "#1e293b",
    padding: "24px",
    borderRadius: "16px",
    maxWidth: "400px",
    width: "100%",
    border: "1px solid #334155"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px"
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: "1.5rem",
    cursor: "pointer"
  },
  modalPrice: {
    color: "#94a3b8",
    marginBottom: "16px"
  },
  modalButtons: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px"
  },
  modalTypeBtn: {
    flex: 1,
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    background: "#2d3748",
    color: "#94a3b8"
  },
  buyActive: {
    background: "#22c55e",
    color: "white"
  },
  sellActive: {
    background: "#ef4444",
    color: "white"
  },
  modalInput: {
    marginBottom: "12px"
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#0b1120",
    color: "white",
    fontSize: "1.2rem",
    marginTop: "4px"
  },
  quickAmounts: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px"
  },
  quickBtn: {
    flex: 1,
    padding: "6px",
    border: "1px solid #334155",
    borderRadius: "6px",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "0.8rem"
  },
  modalTotal: {
    color: "#fbbf24",
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginBottom: "16px"
  },
  confirmBtn: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer"
  },
  confirmBuy: {
    background: "#22c55e",
    color: "white"
  },
  confirmSell: {
    background: "#ef4444",
    color: "white"
  }
  }
