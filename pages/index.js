import { useState } from "react"

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

  const totalValue = holdings.reduce((sum, h) => sum + (h.shares * h.price), 0)

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
      <h1 style={styles.title}>🚀 InvestSmart</h1>
      <p style={styles.cash}>💰 Cash: ${cash.toLocaleString()}</p>
      
      <div style={styles.grid}>
        <div style={styles.card}><div style={styles.label}>Portfolio</div><div style={styles.value}>${totalValue.toLocaleString()}</div></div>
        <div style={styles.card}><div style={styles.label}>Holdings</div><div style={styles.value}>{holdings.length}</div></div>
      </div>

      <div style={styles.holdings}>
        <h3>📊 Your Stocks</h3>
        {holdings.length === 0 ? (
          <p>No stocks yet. Buy some!</p>
        ) : (
          holdings.map((h, i) => (
            <div key={i} style={styles.row}>
              <span><b>{h.symbol}</b></span>
              <span>{h.shares} shares</span>
              <span>${(h.shares * h.price).toLocaleString()}</span>
              <button onClick={() => { setSelectedStock(h); setShowTrade(true) }} style={styles.btn}>Trade</button>
            </div>
          ))
        )}
      </div>

      {showTrade && selectedStock && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Trade {selectedStock.symbol}</h2>
            <p>Price: ${selectedStock.price}</p>
            <input type="number" min="1" value={shares} onChange={(e) => setShares(Number(e.target.value))} style={styles.input} />
            <p>Total: ${(selectedStock.price * shares).toLocaleString()}</p>
            <button onClick={() => handleTrade("BUY")} style={styles.buyBtn}>Buy</button>
            <button onClick={() => handleTrade("SELL")} style={styles.sellBtn}>Sell</button>
            <button onClick={() => setShowTrade(false)} style={styles.cancelBtn}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { background: "#0b1120", color: "white", minHeight: "100vh", padding: "2rem", fontFamily: "system-ui" },
  title: { fontSize: "2.5rem", background: "linear-gradient(135deg, #60a5fa, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  cash: { color: "#94a3b8", fontSize: "1.2rem" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", margin: "2rem 0" },
  card: { background: "#1e293b", padding: "1.5rem", borderRadius: "12px" },
  label: { color: "#94a3b8" },
  value: { fontSize: "1.8rem", fontWeight: "bold" },
  holdings: { background: "#1e293b", padding: "1.5rem", borderRadius: "12px", marginBottom: "1rem" },
  row: { display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #334155", alignItems: "center" },
  btn: { background: "#3b82f6", color: "white", border: "none", padding: "0.3rem 1rem", borderRadius: "6px", cursor: "pointer" },
  modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center" },
  modalContent: { background: "#1e293b", padding: "2rem", borderRadius: "16px", maxWidth: "350px", width: "100%" },
  input: { width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid #334155", background: "#0b1120", color: "white", margin: "0.5rem 0" },
  buyBtn: { width: "100%", padding: "0.75rem", background: "#22c55e", color: "white", border: "none", borderRadius: "8px", margin: "0.25rem 0", cursor: "pointer" },
  sellBtn: { width: "100%", padding: "0.75rem", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", margin: "0.25rem 0", cursor: "pointer" },
  cancelBtn: { width: "100%", padding: "0.75rem", background: "#334155", color: "white", border: "none", borderRadius: "8px", margin: "0.25rem 0", cursor: "pointer" }
      }
