import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Zap, Star, Crown } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, Fair Pricing
          </h1>
          <p className="font-mono text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for your cross-promotion needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Free Plan */}
          <Card className="font-mono relative">
            <CardHeader>
              <div className="flex items-center mb-2">
                <Zap className="h-5 w-5 text-green-500 mr-2" />
                <CardTitle className="text-xl">Free</CardTitle>
              </div>
              <div className="text-3xl font-bold mb-2">$0</div>
              <CardDescription>Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Submit up to 2 products
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Unlimited promotions
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Basic analytics
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Community access
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Credit-based system
                </li>
              </ul>
              <Button className="w-full font-mono" asChild>
                <Link href="/auth/signup">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="font-mono relative border-primary border-2">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-full">
                MOST POPULAR
              </span>
            </div>
            <CardHeader>
              <div className="flex items-center mb-2">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                <CardTitle className="text-xl">Pro</CardTitle>
              </div>
              <div className="text-3xl font-bold mb-2">
                $29<span className="text-base font-normal text-muted-foreground">/month</span>
              </div>
              <CardDescription>For serious indie makers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Unlimited products
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Priority placement
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Advanced analytics
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Email support
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Custom promotion templates
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  API access
                </li>
              </ul>
              <Button className="w-full font-mono" asChild>
                <Link href="/auth/signup">Start Pro Trial</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="font-mono relative">
            <CardHeader>
              <div className="flex items-center mb-2">
                <Crown className="h-5 w-5 text-purple-500 mr-2" />
                <CardTitle className="text-xl">Enterprise</CardTitle>
              </div>
              <div className="text-3xl font-bold mb-2">Custom</div>
              <CardDescription>For teams and agencies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Everything in Pro
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Team management
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  White-label options
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Priority support
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Custom integrations
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  SLA guarantee
                </li>
              </ul>
              <Button variant="outline" className="w-full font-mono" asChild>
                <Link href="/contact">Contact Sales</Link>
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