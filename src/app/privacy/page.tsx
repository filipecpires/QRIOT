
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4 sm:px-6 lg:px-8">
       <Button variant="outline" size="sm" asChild className="mb-8">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Início
        </Link>
      </Button>
      <h1 className="text-3xl font-bold text-primary mb-6">Política de Privacidade - QRIoT.app</h1>
      <div className="space-y-6 text-muted-foreground">
        <p>Esta Política de Privacidade descreve como suas informações pessoais são coletadas, usadas e compartilhadas quando você visita ou usa o QRIoT.app (o "Serviço").</p>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">1. Informações Pessoais que Coletamos</h2>
          <p>Quando você se registra no Serviço, coletamos certas informações suas, incluindo seu nome, endereço de email e informações de pagamento (se aplicável a planos pagos). Coletamos também dados sobre os ativos que você cadastra, como nome, categoria, localização, características e fotos.</p>
          <p>Quando você acessa a página pública de um ativo, podemos registrar automaticamente informações como seu endereço IP e o tipo de dispositivo usado para fins de segurança e análise.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">2. Como Usamos Suas Informações Pessoais</h2>
          <p>Usamos as informações que coletamos para:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Fornecer e manter o Serviço;</li>
            <li>Processar suas transações e gerenciar sua conta;</li>
            <li>Melhorar, personalizar e expandir nosso Serviço;</li>
            <li>Entender e analisar como você usa nosso Serviço;</li>
            <li>Desenvolver novos produtos, serviços, recursos e funcionalidades;</li>
            <li>Comunicar com você, diretamente ou através de um de nossos parceiros, inclusive para atendimento ao cliente, para fornecer atualizações e outras informações relacionadas ao Serviço, e para fins de marketing e promocionais (com seu consentimento, quando necessário);</li>
            <li>Prevenir fraudes e garantir a segurança do nosso Serviço.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">3. Compartilhamento de Suas Informações Pessoais</h2>
          <p>Não compartilhamos suas informações pessoais com terceiros, exceto nas seguintes circunstâncias limitadas:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Com seu consentimento;</li>
            <li>Com provedores de serviços terceirizados que nos ajudam a operar nosso Serviço (por exemplo, processadores de pagamento, provedores de hospedagem), que estão obrigados a proteger suas informações;</li>
            <li>Para cumprir obrigações legais;</li>
            <li>Para proteger e defender nossos direitos ou propriedade.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">4. Segurança dos Dados</h2>
          <p>Implementamos medidas de segurança para proteger suas informações pessoais. No entanto, nenhum método de transmissão pela Internet ou método de armazenamento eletrônico é 100% seguro.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">5. Seus Direitos</h2>
          <p>Dependendo da sua localização, você pode ter certos direitos em relação às suas informações pessoais, como o direito de acessar, corrigir ou excluir suas informações. Entre em contato conosco para exercer seus direitos.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">6. Cookies</h2>
          <p>Usamos cookies e tecnologias de rastreamento semelhantes para rastrear a atividade em nosso Serviço e manter certas informações. Você pode instruir seu navegador a recusar todos os cookies ou a indicar quando um cookie está sendo enviado.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">7. Alterações a Esta Política de Privacidade</h2>
          <p>Podemos atualizar nossa Política de Privacidade de tempos em tempos. Notificaremos você sobre quaisquer alterações publicando a nova Política de Privacidade nesta página.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">8. Contato</h2>
          <p>Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco em <a href="mailto:contato@qriot.app" className="text-primary hover:underline">contato@qriot.app</a>.</p>
        </section>

        <p className="text-sm pt-4">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
      </div>
    </div>
  );
}
