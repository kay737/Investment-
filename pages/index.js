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
  const [activeTab, setActiveTab] = useState("portfolio")

  // Fetch live prices
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
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>📊 InvestSmart</h1>
        <div style={styles.headerRight}>
          <span style={styles.liveBadge}>● Live</span>
          <span style={styles.balance}>${cash.toLocaleString()}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button 
          onClick={() => setActiveTab("portfolio")} 
          style={{ ...styles.tab, ...(activeTab === "portfolio" ? styles.activeTab : {}) }}
        >
          Portfolio
        </button>
        <button 
          onClick={() => setActiveTab("trade")} 
          style={{ ...styles.tab, ...(activeTab === "trade" ? styles.activeTab : {}) }}
        >
          Trade
        </button>
        <button 
          onClick={() => setActiveTab("orders")} 
          style={{ ...styles.tab, ...(activeTab === "orders" ? styles.activeTab : {}) }}
        >
          Orders
        </button>
      </div>

      {/* Portfolio View */}
      {activeTab === "portfolio" && (
        <div style={styles.panel}>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Total Value</div>
              <div style={styles.statValue}>${totalValue.toLocaleString()}</div>
              <div style={styles.statChange}>+2.4%</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Holdings</div>
              <div style={styles.statValue}>{updatedHoldings.length}</div>
              <div style={styles.statChange}>Assets</div>
            </div>
          </div>

          <div style={styles.holdingsList}>
            <div style={styles.listHeader}>
              <span>Asset</span>
              <span>Price</span>
              <span>Value</span>
              <span>Action</span>
            </div>
            {updatedHoldings.map((h, i) => (
              <div key={i} style={styles.listRow}>
                <span><b>{h.symbol}</b> <span style={styles.shares}>{h.shares}</span></span>
                <span style={styles.price}>${h.price.toFixed(2)}</span>
                <span>${(h.shares * h.price).toLocaleString()}</span>
                <button 
                  onClick={() => { setSelectedStock({ ...h, price: h.price }); setActiveTab("trade"); setTradeType("BUY") }} 
                  style={styles.actionBtn}
                >
                  Trade
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trade View */}
      {activeTab === "trade" && (
        <div style={styles.panel}>
          <div style={styles.tradePanel}>
            <div style={styles.tradeHeader}>
              <h2>{selectedStock ? selectedStock.symbol : "Select Asset"}</h2>
              <span style={styles.tradePrice}>
                ${selectedStock ? selectedStock.price.toFixed(2) : "0.00"}
              </span>
            </div>

            <div style={styles.tradeButtons}>
              <button 
                onClick={() => setTradeType("BUY")} 
                style={{ ...styles.tradeTypeBtn, ...(tradeType === "BUY" ? styles.buyActive : {}) }}
              >
                Buy
              </button>
              <button 
                onClick={() => setTradeType("SELL")} 
                style={{ ...styles.tradeTypeBtn, ...(tradeType === "SELL" ? styles.sellActive : {}) }}
              >
                Sell
              </button>
            </div>

            <div style={styles.tradeInput}>
              <label>Amount</label>
              <input 
                type="number" 
                min="0.01"
                step="0.01"
                value={shares} 
                onChange={(e) => setShares(Math.max(0.01, parseFloat(e.target.value) || 0.01))} 
                style={styles.input}
              />
              <div style={styles.quickAmounts}>
                <button onClick={() => setShares(1)} style={styles.quickBtn}>1</button>
                <button onClick={() => setShares(5)} style={styles.quickBtn}>5</button>
                <button onClick={() => setShares(10)} style={styles.quickBtn}>10</button>
                <button onClick={() => setShares(25)} style={styles.quickBtn}>25</button>
              </div>
            </div>

            <div style={styles.tradeSummary}>
              <div style={styles.summaryRow}>
                <span>Total</span>
                <span style={styles.totalAmount}>
                  ${selectedStock ? (selectedStock.price * shares).toLocaleString() : "0.00"}
                </span>
              </div>
              <div style={styles.summaryRow}>
                <span>Balance</span>
                <span>${cash.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={() => handleTrade(tradeType)}
              style={{ ...styles.confirmBtn, ...(tradeType === "BUY" ? styles.confirmBuy : styles.confirmSell) }}
            >
              {tradeType === "BUY" ? "Buy" : "Sell"} {selectedStock ? selectedStock.symbol : ""}
            </button>
          </div>

          <div style={styles.quickSelect}>
            <h4>Quick Select</h4>
            <div style={styles.quickGrid}>
              {updatedHoldings.map((h, i) => (
                <button 
                  key={i}
                  onClick={() => { setSelectedStock({ ...h, price: h.price }) }} 
                  style={styles.quickStock}
                >
                  {h.symbol}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Orders View */}
      {activeTab === "orders" && (
        <div style={styles.panel}>
          <div style={styles.ordersPanel}>
            <h3 style={styles.ordersTitle}>📋 Open Orders</h3>
            <div style={styles.emptyOrders}>
              <p>No open orders</p>
              <span style={styles.emptySub}>Place a trade to see orders here</span>
            </div>
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
    borderBottom: "1px solid #1e293b"
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
  tabs: {
    display: "flex",
    gap: "4px",
    margin: "16px 0",
    background: "#1e293b",
    borderRadius: "12px",
    padding: "4px"
  },
  tab: {
    flex: 1,
    padding: "10px",
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    borderRadius: "8px",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontWeight: "500"
  },
  activeTab: {
    background: "#2d3748",
    color: "#e5e7eb"
  },
  panel: {
    marginTop: "8px"
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
  statChange: {
    color: "#4ade80",
    fontSize: "0.8rem",
    marginTop: "4px"
  },
  holdingsList: {
    background: "#1e293b",
    borderRadius: "12px",
    border: "1px solid #334155",
    overflow: "hidden"
  },
  listHeader: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 0.8fr",
    padding: "12px 16px",
    background: "#0f172a",
    color: "#94a3b8",
    fontSize: "0.8rem",
    fontWeight: "500"
  },
  listRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 0.8fr",
    padding: "12px 16px",
    borderBottom: "1px solid #334155",
    alignItems: "center",
    fontSize: "0.9rem"
  },
  shares: {
    color: "#94a3b8",
    fontSize: "0.7rem",
    marginLeft: "4px"
  },
  price: {
    color: "#4ade80"
  },
  actionBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "4px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem"
  },
  tradePanel: {
    background: "#1e293b",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #334155"
  },
  tradeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px"
  },
  tradePrice: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#4ade80"
  },
  tradeButtons: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px"
  },
  tradeTypeBtn: {
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
  tradeInput: {
    marginBottom: "16px"
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
    marginTop: "8px"
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
  tradeSummary: {
    background: "#0b1120",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px"
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "4px 0"
  },
  totalAmount: {
    color: "#fbbf24",
    fontWeight: "bold"
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
  },
  quickSelect: {
    marginTop: "16px",
    background: "#1e293b",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #334155"
  },
  quickGrid: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "8px"
  },
  quickStock: {
    padding: "6px 16px",
    background: "#2d3748",
    border: "none",
    borderRadius: "20px",
    color: "#e5e7eb",
    cursor: "pointer",
    fontSize: "0.9rem"
  },
  ordersPanel: {
    background: "#1e293b",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #334155"
  },
  ordersTitle: {
    marginBottom: "16px",
    color: "#94a3b8"
  },
  emptyOrders: {
    textAlign: "center",
    padding: "40px 0",
    color: "#64748b"
  },
  emptySub: {
    fontSize: "0.8rem",
    display: "block",
    marginTop: "4px"
  }
}
