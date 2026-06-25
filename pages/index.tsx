import { useState } from "react"

export default function Home() {
  const [portfolio, setPortfolio] = useState({ 
    total: 124580, 
    today: 1240, 
    cash: 50000,
    holdings: [
      { symbol: "AAPL", shares: 120, price: 178.50, change: 12 },
      { symbol: "TSLA", shares: 45, price: 245.30, change: -3 },
      { symbol: "VTI", shares: 310, price: 259.80, change: 8 },
      { symbol: "BTC", shares: 0.42, price: 67200, change: 15 }
    ]
  })
  const [showTrade, setShowTrade] = useState(false)
  const [selectedStock, setSelectedStock] = useState(null)
  const [shares, setShares] = useState(1)
  const [tradeType, setTradeType] = useState("BUY")
  const [message, setMessage] = useState("")

  const handleTrade = (type) => {
    if (!selectedStock) return
    
    const stock = portfolio.holdings.find(h => h.symbol === selectedStock.symbol)
    const totalCost = selectedStock.price * shares
    
    if (type === "BUY" && totalCost > portfolio.cash) {
      setMessage("Insufficient funds!")
      return
    }

    if (type === "SELL" && stock && shares > stock.shares) {
      setMessage("You don't have enough shares!")
      return
    }

    const updatedHoldings = [...portfolio.holdings]
    const index = updatedHoldings.findIndex(h => h.symbol === selectedStock.symbol)
    
    if (type === "BUY") {
      if (index >= 0) {
        updatedHoldings[index].shares += shares
      } else {
        updatedHoldings.push({
          symbol: selectedStock.symbol,
          shares: shares,
          price: selectedStock.price,
          change: Math.round((Math.random() * 20) - 5)
        })
      }
      setPortfolio({
        ...portfolio,
        cash: portfolio.cash - totalCost,
        holdings: updatedHoldings,
        total: portfolio.total + totalCost
      })
      setMessage("Bought " + shares + " shares of " + selectedStock.symbol)
    } else {
      if (index >= 0) {
        updatedHoldings[index].shares -= shares
        if (updatedHoldings[index].shares <= 0) {
          updatedHoldings.splice(index, 1)
        }
        setPortfolio({
          ...portfolio,
          cash: portfolio.cash + totalCost,
          holdings: updatedHoldings,
          total: portfolio.total - totalCost
        })
        setMessage("Sold " + shares + " shares of " + selectedStock.symbol)
      }
    }

    setShowTrade(false)
    setShares(1)
    setTimeout(() => setMessage(""), 5000)
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>InvestSmart</h1>
        <p style={styles.user}>Cash: ${portfolio.cash.toLocaleString()}</p>
      </div>

      {message && (
        <div style={message.includes("Bought") || message.includes("Sold") ? styles.successMsg : styles.errorMsg}>
          {message}
        </div>
      )}

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Portfolio</div>
          <div style={styles.cardValue}>${portfolio.total.toLocaleString()}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Today</div>
          <div style={{ ...styles.cardValue, color: "#4ade80" }}>+${portfolio.today.toLocaleString()}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Cash</div>
          <div style={{ ...styles.cardValue, color: "#fbbf24" }}>${portfolio.cash.toLocaleString()}</div>
        </div>
      </div>

      <div style={styles.holdings}>
        <h3 style={styles.sectionTitle}>Your Holdings</h3>
        {portfolio.holdings.length === 0 ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: "2rem 0" }}>
            No holdings yet. Start trading!
          </p>
        ) : (
          portfolio.holdings.map((h, i) => (
            <div key={i} style={styles.row}>
              <span><strong>{h.symbol}</strong></span>
              <span>{h.shares} shares</span>
              <span>${h.price.toFixed(2)}</span>
              <span style={h.change >= 0 ? styles.green : styles.red}>
                {h.change >= 0 ? "+" : ""}{h.change}%
              </span>
              <button onClick={() => {
                setSelectedStock(h)
                setTradeType("BUY")
                setShowTrade(true)
              }} style={styles.buyBtn}>Buy</button>
              <button onClick={() => {
                setSelectedStock(h)
                setTradeType("SELL")
                setShowTrade(true)
              }} style={styles.sellBtn}>Sell</button>
            </div>
          ))
        )}
      </div>

      <button style={styles.tradeBtn} onClick={() => {
        setSelectedStock({ symbol: "AAPL", price: 178.50 })
        setTradeType("BUY")
        setShowTrade(true)
      }}>
        Trade New Stock
      </button>

      {showTrade && selectedStock && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Trade {selectedStock.symbol}</h2>
            <p style={styles.modalPrice}>Price: ${selectedStock.price.toFixed(2)}</p>
            
            <div style={styles.modalButtons}>
              <button onClick={() => setTradeType("BUY")} style={{ ...styles.modalTypeBtn, background: tradeType === "BUY" ? "#22c55e" : "#334155" }}>Buy</button>
              <button onClick={() => setTradeType("SELL")} style={{ ...styles.modalTypeBtn, background: tradeType === "SELL" ? "#ef4444" : "#334155" }}>Sell</button>
            </div>

            <div style={styles.modalInput}>
              <label>Shares:</label>
              <input type="number" min="1" value={shares} onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))} style={styles.input} />
            </div>

            <p style={styles.modalTotal}>Total: ${(selectedStock.price * shares).toLocaleString()}</p>

            <button onClick={() => handleTrade(tradeType)} style={tradeType === "BUY" ? styles.confirmBuy : styles.confirmSell}>
              Confirm {tradeType}
            </button>
            <button onClick={() => setShowTrade(false)} style={styles.closeModal}>Cancel</button>
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
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem"
  },
  logo: {
    fontSize: "2rem",
    background: "linear-gradient(135deg, #60a5fa, #fbbf24)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },
  user: {
    color: "#94a3b8"
  },
  successMsg: {
    background: "#052e16",
    color: "#4ade80",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    border: "1px solid #22c55e"
  },
  errorMsg: {
    background: "#450a0a",
    color: "#f87171",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    border: "1px solid #ef4444"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    marginBottom: "2rem"
  },
  card: {
    background: "#1e293b",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #334155",
  },
  cardLabel: {
    color: "#94a3b8",
    fontSize: "0.9rem"
  },
  cardValue: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    marginTop: "0.5rem"
  },
  holdings: {
    background: "#1e293b",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #334155",
    marginBottom: "2rem"
  },
  sectionTitle: {
    color: "#94a3b8",
    marginBottom: "1rem"
  },
  row: {
    display: "grid",
    gridTemplateColumns: "80px 100px 100px 80px 60px 60px",
    alignItems: "center",
    padding: "0.8rem 0",
    borderBottom: "1px solid #334155",
    gap: "0.5rem"
  },
  green: {
    color: "#4ade80"
  },
  red: {
    color: "#f87171"
  },
  buyBtn: {
    background: "#22c55e",
    color: "white",
    border: "none",
    padding: "0.3rem 0.8rem",
    borderRadius: "4px",
    cursor: "pointer"
  },
  sellBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "0.3rem 0.8rem",
    borderRadius: "4px",
    cursor: "pointer"
  },
  tradeBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "1rem",
    borderRadius: "8px",
    fontSize: "1.1rem",
    cursor: "pointer",
    width: "100%"
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  modalContent: {
    background: "#1e293b",
    padding: "2rem",
    borderRadius: "16px",
    maxWidth: "400px",
    width: "100%",
    border: "1px solid #334155"
  },
  modalPrice: {
    color: "#94a3b8",
    marginBottom: "1rem"
  },
  modalButtons: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1rem"
  },
  modalTypeBtn: {
    flex: 1,
    padding: "0.5rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    color: "white"
  },
  modalInput: {
    marginBottom: "1rem"
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#0b1120",
    color: "white",
    marginTop: "0.3rem"
  },
  modalTotal: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    color: "#fbbf24"
  },
  confirmBuy: {
    width: "100%",
    padding: "0.75rem",
    background: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "0.5rem"
  },
  confirmSell: {
    width: "100%",
    padding: "0.75rem",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "0.5rem"
  },
  closeModal: {
    width: "100%",
    padding: "0.75rem",
    background: "#334155",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }
} as const
