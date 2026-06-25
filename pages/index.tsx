import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect, useState } from "react"

export default function Home() {
  const { data: session } = useSession()
  const [portfolio, setPortfolio] = useState({ total: 124580, today: 1240, invested: 98200, dividends: 3420 })

  if (!session) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>🚀 InvestSmart</h1>
          <p style={styles.subtitle}>Your Investment Dashboard</p>
          <button onClick={() => signIn("google")} style={styles.googleBtn}>
            <span style={{ marginRight: "10px" }}>G</span>
            Sign in with Google
          </button>
          <br />
          <br />
          <button onClick={() => signIn("credentials", { email: "demo@demo.com", password: "password" })} style={styles.demoBtn}>
            Try Demo Account
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.logo}>🚀 InvestSmart</h1>
          <p style={styles.user}>Welcome, {session.user.name || "Investor"}!</p>
        </div>
        <button onClick={() => signOut()} style={styles.signOutBtn}>
          Sign Out
        </button>
      </div>

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
          <div style={styles.cardLabel}>Invested</div>
          <div style={styles.cardValue}>${portfolio.invested.toLocaleString()}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Dividends</div>
          <div style={{ ...styles.cardValue, color: "#fbbf24" }}>${portfolio.dividends.toLocaleString()}</div>
        </div>
      </div>

      <div style={styles.holdings}>
        <h3 style={styles.sectionTitle}>📊 Your Holdings</h3>
        <div style={styles.row}><span>AAPL</span><span>120 shares</span><span style={styles.green}>+12%</span></div>
        <div style={styles.row}><span>TSLA</span><span>45 shares</span><span style={styles.red}>-3%</span></div>
        <div style={styles.row}><span>VTI</span><span>310 shares</span><span style={styles.green}>+8%</span></div>
        <div style={styles.row}><span>BTC</span><span>0.42 BTC</span><span style={styles.green}>+15%</span></div>
      </div>

      <button style={styles.tradeBtn} onClick={() => alert("Trading coming soon!")}>
        🚀 Start Trading
      </button>
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
  card: {
    background: "#1e293b",
    padding: "2rem",
    borderRadius: "12px",
    border: "1px solid #334155",
  },
  title: {
    fontSize: "3rem",
    background: "linear-gradient(135deg, #60a5fa, #fbbf24)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "0.5rem"
  },
  subtitle: {
    color: "#94a3b8",
    marginBottom: "2rem"
  },
  googleBtn: {
    background: "#fff",
    color: "#333",
    border: "none",
    padding: "0.75rem 2rem",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    fontWeight: "bold"
  },
  demoBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "0.75rem 2rem",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem"
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
  signOutBtn: {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "0.5rem 1.5rem",
    borderRadius: "8px",
    cursor: "pointer"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
    marginBottom: "2rem"
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
    display: "flex",
    justifyContent: "space-between",
    padding: "0.8rem 0",
    borderBottom: "1px solid #334155"
  },
  green: {
    color: "#4ade80"
  },
  red: {
    color: "#f87171"
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
  }
} as const
