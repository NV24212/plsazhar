import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export default function PlaceholderPage({ title, description, icon: Icon = Construction }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-2">{description}</p>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <Icon className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
            {title} Page Coming Soon
          </CardTitle>
          <CardDescription className="text-base mb-6">
            This section is currently under development. The {title.toLowerCase()} functionality will include advanced features for managing your business operations.
          </CardDescription>
          <div className="space-y-3 text-sm text-gray-600">
            <p>💡 <strong>Tip:</strong> Continue chatting to have me build out this {title.toLowerCase()} page with full functionality</p>
            <p>🚀 This will include forms, tables, search, filtering, and complete CRUD operations</p>
          </div>
          <div className="mt-8">
            <Link to="/">
              <Button className="bg-dashboard-primary hover:bg-dashboard-primary-light">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
