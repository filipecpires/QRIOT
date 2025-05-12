
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4 sm:px-6 lg:px-8">
      <Button variant="outline" size="sm" asChild className="mb-8">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Início
        </Link>
      </Button>
      <h1 className="text-3xl font-bold text-primary mb-6">Termos de Uso - QRIoT.app</h1>
      <div className="space-y-6 text-muted-foreground">
        <p>Bem-vindo ao QRIoT.app! Ao usar nossos serviços, você concorda com estes termos. Leia-os com atenção.</p>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">1. Aceitação dos Termos</h2>
          <p>Ao acessar ou usar o QRIoT.app (o "Serviço"), você concorda em cumprir e estar vinculado a estes Termos de Uso ("Termos"). Se você não concorda com estes Termos, não use o Serviço.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">2. Descrição do Serviço</h2>
          <p>O QRIoT.app é um sistema online para gestão de ativos físicos, inventário, registro de informações detalhadas sobre cada item, controle de local de instalação com ponto GPS, registro de responsáveis e acompanhamento de histórico de movimentação, utilizando QR Codes para identificação.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">3. Contas de Usuário</h2>
          <p>Para acessar certas funcionalidades do Serviço, você pode precisar criar uma conta. Você é responsável por manter a confidencialidade das informações da sua conta, incluindo sua senha, e por todas as atividades que ocorram sob sua conta. Você concorda em nos notificar imediatamente sobre qualquer uso não autorizado de sua conta ou senha.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">4. Uso Aceitável</h2>
          <p>Você concorda em não usar o Serviço para qualquer finalidade ilegal ou proibida por estes Termos. Você não pode usar o Serviço de qualquer maneira que possa danificar, desabilitar, sobrecarregar ou prejudicar o Serviço ou interferir no uso e aproveitamento do Serviço por qualquer outra parte.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">5. Conteúdo do Usuário</h2>
          <p>Você é o único responsável por todo o conteúdo que você carrega, publica, envia por email, transmite ou de outra forma disponibiliza através do Serviço ("Conteúdo do Usuário"). Você retém todos os direitos sobre seu Conteúdo do Usuário, mas nos concede uma licença mundial, não exclusiva, isenta de royalties para usar, reproduzir, modificar e distribuir seu Conteúdo do Usuário em conexão com a operação e promoção do Serviço.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">6. Planos e Pagamentos</h2>
          <p>O QRIoT.app oferece um plano gratuito com limitações (por exemplo, 5 ativos). Planos pagos com mais funcionalidades e limites maiores podem estar disponíveis. Os termos específicos de planos pagos, incluindo preços, ciclo de faturamento e políticas de cancelamento, serão apresentados a você antes da sua inscrição em um plano pago.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">7. Limitação de Responsabilidade</h2>
          <p>Na máxima extensão permitida pela lei aplicável, em nenhum caso o QRIoT.app será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, ou qualquer perda de lucros ou receitas, incorridos direta ou indiretamente, ou qualquer perda de dados, uso, ágio ou outras perdas intangíveis, resultantes de (a) seu acesso ou uso ou incapacidade de acessar ou usar o serviço; (b) qualquer conduta ou conteúdo de terceiros no serviço.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">8. Alterações nos Termos</h2>
          <p>Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. Se uma revisão for material, faremos o possível para fornecer um aviso com pelo menos 30 dias de antecedência antes que quaisquer novos termos entrem em vigor. O que constitui uma alteração material será determinado a nosso exclusivo critério.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">9. Contato</h2>
          <p>Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco em <a href="mailto:contato@qriot.app" className="text-primary hover:underline">contato@qriot.app</a>.</p>
        </section>

        <p className="text-sm pt-4">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
      </div>
    </div>
  );
}
