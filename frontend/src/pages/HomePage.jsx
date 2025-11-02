import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Truck, Route, Package, TrendingUp, MapPin, Clock, Award } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Route,
      title: 'Multi-Stage Graph Optimization',
      description: 'Dynamic programming solution for optimal sequential delivery paths through mandatory distribution hubs.',
      color: 'text-[hsl(var(--primary))]',
      bgColor: 'bg-[hsl(var(--primary))]/10'
    },
    {
      icon: Truck,
      title: 'Traveling Salesman Problem',
      description: 'Find the shortest possible route visiting all delivery locations exactly once and returning to origin.',
      color: 'text-[hsl(var(--secondary))]',
      bgColor: 'bg-[hsl(var(--secondary))]/10'
    },
    {
      icon: Package,
      title: 'Fractional Knapsack',
      description: 'Maximize profit per trip by optimally selecting packages based on value-to-weight ratios.',
      color: 'text-[hsl(var(--accent))]',
      bgColor: 'bg-[hsl(var(--accent))]/10'
    }
  ];

  const stats = [
    { icon: TrendingUp, value: '45%', label: 'Cost Reduction' },
    { icon: Clock, value: '2.3x', label: 'Faster Delivery' },
    { icon: MapPin, value: '98%', label: 'Route Efficiency' },
    { icon: Package, value: '34%', label: 'Load Optimization' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[hsl(var(--muted))] to-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 bg-[hsl(var(--primary))] rounded-lg">
                <Truck className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Vectorpath</h1>
                <p className="text-xs text-muted-foreground">Intelligent Delivery Network</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button size="lg" onClick={() => navigate('/dashboard')}>
                Get Started
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-4 px-4 py-1.5 bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 rounded-full">
              <span className="text-sm font-medium text-[hsl(var(--primary))]">Advanced Algorithm Solutions</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Optimize Your
              <span className="block text-gradient-primary">Delivery Network</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Transform your e-commerce logistics with cutting-edge algorithms. Minimize costs, maximize efficiency, 
              and deliver faster across multiple warehouses and distribution centers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={() => navigate('/dashboard')}>
                Get Started
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--primary))]/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[hsl(var(--secondary))]/20 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="bg-background/80 rounded-lg p-4 border border-border/50"
                    >
                      <stat.icon className="w-5 h-5 text-[hsl(var(--primary))] mb-2" />
                      <div className="text-2xl font-bold mb-1">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="bg-background/80 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--accent))]/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[hsl(var(--accent))]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Performance Index</div>
                      <div className="text-xs text-muted-foreground">Real-time optimization</div>
                    </div>
                  </div>
                  <div className="flex gap-1 h-20">
                    {[65, 78, 45, 89, 67, 92, 88, 95, 72, 85, 90, 98].map((height, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 0.8 + i * 0.05, duration: 0.3 }}
                        className="flex-1 bg-[hsl(var(--primary))] rounded-t"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-3xl lg:text-4xl font-bold mb-4">Powered by Advanced Algorithms</h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three industry-leading optimization techniques working together to revolutionize your logistics operations.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-8 h-full border-border/50 hover:border-[hsl(var(--primary))]/30 transition-all duration-300 hover:shadow-lg group">
                <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h4 className="text-xl font-semibold mb-3">{feature.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-12 lg:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[hsl(var(--primary))]/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Optimize Your Logistics?</h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start using our advanced algorithms today and see immediate improvements in your delivery network efficiency.
            </p>
            <Button size="lg" onClick={() => navigate('/dashboard')}>
              Get Started
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[hsl(var(--primary))] rounded-lg">
                <Truck className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-semibold">Vectorpath</div>
                <div className="text-xs text-muted-foreground">DAA Algorithm Project</div>
              </div>
            </div>
            {/* footer copyright removed per request */}
          </div>
        </div>
      </footer>
    </div>
  );
}