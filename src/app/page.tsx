
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authenticate, storeCredentials, storeBusinessCentralToken } from '@/lib/api-client';
import { DEMO_BC_TOKEN } from '@/lib/constants';
import { useToast } from "@/hooks/use-toast";
import { LogIn, KeyRound } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [idNumber, setIdNumber] = useState('2110705959');
  const [username, setUsername] = useState('bjarni');
  const [password, setPassword] = useState('Hugvit1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    if (!idNumber) {
       toast({
        title: "Innskráning mistókst",
        description: "Vinsamlegast fylltu út kennitölu.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Always perform main authentication
      const mainAuthUsername = username || 'bjarni';
      const mainAuthPassword = password || 'Hugvit1';
      const mainAppToken = await authenticate(mainAuthUsername, mainAuthPassword);

      if (!mainAppToken) {
          throw new Error("Ekki tókst að nálgast auðkennislykil fyrir aðalinnskráningu.");
      }

      // Store main credentials
      const displayUsername = username || 'bjarni';
      storeCredentials(mainAppToken, displayUsername, idNumber);

      // Automatically store the hardcoded Business Central token for demo purposes
      if (DEMO_BC_TOKEN) {
        storeBusinessCentralToken(DEMO_BC_TOKEN);
      }

      toast({
        title: "Innskráning tókst!",
        description: `Velkomin/n, ${displayUsername}.`,
      });
      router.push('/dashboard');

    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : "Óþekkt villa kom upp.";
      let fullErrorMessage = `Innskráning mistókst: ${errorMessage}`;
      setError(fullErrorMessage);
      toast({
        title: "Innskráning mistókst",
        description: fullErrorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <LogIn className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">FANGELSISMÁLASTOFNUN</CardTitle>
          <CardDescription>Stjórnkerfi fangelsismála</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="idNumber">Kennitala</Label>
              <Input
                id="idNumber"
                type="text"
                placeholder="Kennitala"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Notandanafn</Label>
              <Input
                id="username"
                type="text"
                placeholder="Notandanafn"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Lykilorð</Label>
              <Input
                id="password"
                type="password"
                placeholder="Lykilorð"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>


            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Villa</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Skráir inn...' : 'Innskrá'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
