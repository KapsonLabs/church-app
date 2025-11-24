import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Users, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { PublicRoute } from '@/components/auth/PublicRoute';

const SignIn = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }

    const success = await login(username, password);
    
    if (success) {
      toast({
        title: "Welcome Back!",
        description: "Successfully signed in to your account.",
      });
      navigate({ to: '/crm' });
    } else {
      toast({
        title: "Sign In Failed",
        description: "Invalid username or password. Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/90 to-primary/70 items-center justify-center p-12 text-white">
          <div className="max-w-md space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Users className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-bold">Resolver 1ne</h1>
              </div>
              <p className="text-xl text-white/90 leading-relaxed">
                Manage your customer relationships and agents performance metrics
              </p>
            </div>
            
            <div className="space-y-4 pt-8 border-t border-white/20">
              <div className="flex items-start space-x-3">
                <div className="mt-1 p-1.5 bg-white/20 rounded">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Customer Management</h3>
                  <p className="text-sm text-white/80">
                    Track and manage all your customer interactions in one place
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-1 p-1.5 bg-white/20 rounded">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Secure & Reliable</h3>
                  <p className="text-sm text-white/80">
                    Your data is protected with enterprise-grade security
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">CRM System</h1>
            </div>

            <Card className="border shadow-lg">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-semibold">Welcome Back</CardTitle>
                <CardDescription className="text-base">
                  Sign in to your CRM account to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      Username
                    </Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="h-11 pl-10"
                        disabled={isLoading}
                        autoComplete="username"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 pl-10 pr-10"
                        disabled={isLoading}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                        disabled={isLoading}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Help Text */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-xs text-center text-muted-foreground">
                    Having trouble signing in? Contact your system administrator
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>© 2024 CRM System. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
};

export default SignIn;
