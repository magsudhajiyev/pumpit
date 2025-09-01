import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Blog - PumpIt",
  description: "Insights and tips for indie makers on cross-promotion and product marketing",
};

const blogPosts = [
  {
    id: "cross-promotion-guide",
    title: "The Complete Guide to Cross-Promotion for Indie Makers",
    excerpt: "Learn how strategic partnerships can amplify your product's reach and build lasting relationships in the indie community.",
    date: "2024-08-28",
    readTime: "8 min read",
    category: "Strategy"
  },
  {
    id: "building-community",
    title: "Building a Community Around Your Product",
    excerpt: "Discover proven strategies to create an engaged community that becomes your biggest marketing asset.",
    date: "2024-08-25",
    readTime: "6 min read",
    category: "Community"
  },
  {
    id: "metrics-matter",
    title: "Why Promotion Metrics Matter More Than You Think",
    excerpt: "Understanding key metrics helps you identify the most effective promotion strategies and optimize your marketing efforts.",
    date: "2024-08-22",
    readTime: "5 min read",
    category: "Analytics"
  },
  {
    id: "indie-maker-partnerships",
    title: "Finding the Right Partners: A Guide for Indie Makers",
    excerpt: "How to identify, approach, and collaborate with other indie makers who share your target audience.",
    date: "2024-08-20",
    readTime: "7 min read",
    category: "Partnerships"
  },
  {
    id: "launch-strategies",
    title: "Product Launch Strategies That Actually Work",
    excerpt: "Time-tested launch strategies that indie makers can implement without breaking the bank.",
    date: "2024-08-18",
    readTime: "9 min read",
    category: "Launch"
  },
  {
    id: "content-marketing-indie",
    title: "Content Marketing for Indie Products: Less is More",
    excerpt: "How to create compelling content that drives engagement and conversions with limited resources.",
    date: "2024-08-15",
    readTime: "6 min read",
    category: "Content"
  }
];

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">PumpIt Blog</h1>
          <p className="text-lg text-muted-foreground">
            Insights, strategies, and success stories for indie makers navigating the world of cross-promotion.
          </p>
        </div>

        <div className="grid gap-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                    {post.category}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(post.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <CardTitle className="text-2xl">
                  <Link 
                    href={`/blog/${post.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{post.readTime}</span>
                  <Link 
                    href={`/blog/${post.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Read more →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}