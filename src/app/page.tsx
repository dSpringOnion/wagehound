export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🦴 WageHound</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Track your wages and tips with ease
        </p>
        <div className="space-x-4">
          <a 
            href="/login" 
            className="inline-block bg-primary hover:bg-primary/80 text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Get Started
          </a>
          <a 
            href="/dashboard" 
            className="inline-block bg-secondary hover:bg-secondary/80 text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
