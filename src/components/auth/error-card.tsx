import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const ErrorCard = () => {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Resetar sua senha</CardTitle>
        <CardDescription>
          Digite uma nova senha para redefinir o acesso à sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex w-full items-center justify-center">
          <AlertTriangle className="text-destructive" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorCard;
