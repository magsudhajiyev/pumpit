import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Zap, Star } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, Fair Pricing
          </h1>
          <p className="font-mono text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Choose the plan that works best for your cross-promotion needs. Get more visibility, partnerships, and growth for your indie products.
          </p>
          <div className="bg-muted/30 rounded-lg p-6 max-w-4xl mx-auto">
            <h3 className="font-mono text-lg font-semibold mb-4">What You Get with PumpIt:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Cross-promotion opportunities</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Partner discovery & matching</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Performance analytics & tracking</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Community access</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Promotion campaign management</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Growth insights & recommendations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="font-mono relative group transition-all duration-500 hover:shadow-xl hover:shadow-green-500/10 hover:border-green-200/50 hover:-translate-y-2 hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-700"
            style={{ animationDelay: "0ms" }}>
            <CardHeader>
              <div className="flex items-center mb-2">
                <Zap className="h-5 w-5 text-green-500 mr-2 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
                <CardTitle className="text-xl group-hover:text-green-600 transition-colors duration-300">Free</CardTitle>
              </div>
              <div className="text-3xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                $0<span className="text-base font-normal text-muted-foreground">/forever</span>
              </div>
              <CardDescription>Perfect for getting started with cross-promotion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center transition-all duration-300 hover:translate-x-1">
                  <Check className="h-4 w-4 text-green-500 mr-2 transition-all duration-300 group-hover:scale-110" />
                  <span><strong>Submit up to 2 products</strong> for cross-promotion</span>
                </li>
                <li className="flex items-center transition-all duration-300 hover:translate-x-1">
                  <Check className="h-4 w-4 text-green-500 mr-2 transition-all duration-300 group-hover:scale-110" />
                  <span><strong>Unlimited promotion campaigns</strong> with other makers</span>
                </li>
                <li className="flex items-center transition-all duration-300 hover:translate-x-1">
                  <Check className="h-4 w-4 text-green-500 mr-2 transition-all duration-300 group-hover:scale-110" />
                  <span><strong>Basic analytics dashboard</strong> with traffic & conversion data</span>
                </li>
                <li className="flex items-center transition-all duration-300 hover:translate-x-1">
                  <Check className="h-4 w-4 text-green-500 mr-2 transition-all duration-300 group-hover:scale-110" />
                  <span><strong>Community forum access</strong> to connect with indie makers</span>
                </li>
                <li className="flex items-center transition-all duration-300 hover:translate-x-1">
                  <Check className="h-4 w-4 text-green-500 mr-2 transition-all duration-300 group-hover:scale-110" />
                  <span><strong>Credit-based promotion system</strong> - promote to earn credits</span>
                </li>
              </ul>
              <Button className="w-full font-mono transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-500/20 group-hover:scale-105" asChild>
                <Link href="/auth/signup">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="font-mono relative border-primary border-2 group transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary hover:-translate-y-2 hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-700"
            style={{ animationDelay: "150ms" }}>
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-full transition-all duration-300 group-hover:scale-110 group-hover:pulse">
                MOST POPULAR
              </span>
            </div>
            <CardHeader>
              <div className="flex items-center mb-2">
                <Star className="h-5 w-5 text-yellow-500 mr-2 transition-all duration-300 group-hover:scale-125 group-hover:rotate-[360deg] group-hover:text-yellow-400" />
                <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">Pro</CardTitle>
              </div>
              <div className="text-3xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                $29<span className="text-base font-normal text-muted-foreground">/month</span>
              </div>
              <CardDescription>For serious indie makers looking to scale their reach</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center transition-all duration-300 hover:translate-x-1">
                  <Check className="h-4 w-4 text-green-500 mr-2 transition-all duration-300 group-hover:scale-110" />
                  <span><strong>Unlimited products</strong> for cross-promotion campaigns</span>
                </li>
                <li className="flex items-center transition-all duration-300 hover:translate-x-1">
                  <Check className="h-4 w-4 text-green-500 mr-2 transition-all duration-300 group-hover:scale-110" />
                  <span><strong>Priority placement</strong> in partner discovery & matching</span>
                </li>
                <li className="flex items-center transition-all duration-300 hover:translate-x-1">
                  <Check className="h-4 w-4 text-green-500 mr-2 transition-all duration-300 group-hover:scale-110" />
                  <span><strong>Advanced analytics suite</strong> with ROI tracking & insights</span>
                </li>
                <li className="flex items-center transition-all duration-300 hover:translate-x-1">
                  <Check className="h-4 w-4 text-green-500 mr-2 transition-all duration-300 group-hover:scale-110" />
                  <span><strong>Priority email support</strong> within 24 hours</span>
                </li>
                <li className="flex items-center transition-all duration-300 hover:translate-x-1">
                  <Check className="h-4 w-4 text-green-500 mr-2 transition-all duration-300 group-hover:scale-110" />
                  <span><strong>Custom promotion templates</strong> & campaign tools</span>
                </li>
                <li className="flex items-center transition-all duration-300 hover:translate-x-1">
                  <Check className="h-4 w-4 text-green-500 mr-2 transition-all duration-300 group-hover:scale-110" />
                  <span><strong>API access</strong> for automation & integrations</span>
                </li>
              </ul>
              <Button className="w-full font-mono transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:scale-105 group-hover:bg-primary/90" asChild>
                <Link href="/auth/signup">Start Pro Trial</Link>
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-mono text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6 font-mono text-sm">
            <div>
              <h3 className="font-semibold mb-2">What happens when I reach my product limit?</h3>
              <p className="text-muted-foreground">
                On the free plan, you can submit up to 2 products. You can upgrade to Pro anytime to submit unlimited products.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How does the credit system work?</h3>
              <p className="text-muted-foreground">
                You earn credits by promoting other products. Use these credits to get your own products promoted by the community.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. Your plan will remain active until the end of your current billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground">
                We offer a 30-day money-back guarantee for all paid plans. No questions asked.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}