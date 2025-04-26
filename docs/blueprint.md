# **App Name**: QRot.io

## Core Features:

- Asset Registration: Register assets with name, category, unique tag (identification), installation location, and responsible person.
- QR Code Generation: Each asset automatically generates a QR Code with a direct link to its public page.
- Location Registration: Register installation locations, providing name and GPS location (latitude and longitude).
- User Registration: Register users with different permission levels (such as administrator, manager, technician, or inventory clerk).
- Hierarchy Control: Hierarchy control: each user can have a manager, and managers can only see the assets of subordinates.
- Asset Characteristics: Register characteristics of each asset (example: voltage, capacity, year of manufacture).
- Visibility Control: Possibility to choose which characteristics are visible on the asset's public page.
- Inventory Registration: Inventory registration as a characteristic, marking the date the asset was inventoried.
- Lost Asset Marking: Marking assets as 'lost,' with a visible alert on the public page.
- Access Logging: Automatic registration of all public accesses to asset pages, with date, IP, and type of device used.
- Photo Upload: Upload photos associated with assets.
- Attachment Insertion: Insert external links as attachments (example: reports, manuals on Google Drive).
- Data Control: Control who can create, edit, or delete data, according to the user's profile.
- Logical Exclusion: Logical exclusion of characteristics: they are never really deleted, just marked as inactive.

## Style Guidelines:

- Primary color: Dark blue (#003049) for a professional and secure feel.
- Secondary color: Light gray (#D6D6D6) for backgrounds and neutral elements.
- Accent: Teal (#40E0D0) for interactive elements and QR code highlights.
- Clean and responsive layout optimized for both desktop and mobile scanning.
- Use simple, clear icons to represent asset categories and actions.

## Original User Request:
Nome do Sistema:
QRot.io – Gestão de Ativos com QR Code

O que é o QRot.io:
O QRot.io é um sistema online que permite gerenciar ativos físicos, fazer inventário, registrar informações detalhadas sobre cada item, controlar o local de instalação com ponto GPS, registrar quem é o responsável pelo ativo e acompanhar todo o histórico de movimentação.

Cada ativo terá um QR Code que, ao ser escaneado, leva para uma página pública de visualização do ativo, mesmo sem login.

O sistema é feito para ser prático, seguro e inteligente, facilitando o dia a dia de quem precisa controlar patrimônio em qualquer empresa.

O desenvolvimento será feito no Firebase Studio, usando os recursos de banco de dados, autenticação e armazenamento da plataforma.

Principais Funcionalidades:
Cadastro de ativos com nome, categoria, tag única (identificação), local de instalação e responsável.

Cada ativo gera automaticamente um QR Code com link direto para sua página pública.

Cadastro de locais de instalação, informando nome e localização GPS (latitude e longitude).

Cadastro de usuários que terão diferentes níveis de permissão (como administrador, gerente, técnico ou inventariante).

Controle de hierarquia: cada usuário pode ter um gerente, e gerentes podem ver apenas os ativos dos subordinados.

Cadastro de características de cada ativo (exemplo: voltagem, capacidade, ano de fabricação).

Possibilidade de escolher quais características ficam visíveis na página pública do ativo.

Registro de inventário como uma característica, marcando a data em que o ativo foi inventariado.

Marcação de ativos como "perdidos", com um alerta visível na página pública.

Registro automático de todos os acessos públicos a páginas de ativos, com data, IP e tipo de dispositivo usado.

Upload de fotos associadas aos ativos.

Inserção de links externos como anexos (exemplo: laudos, manuais no Google Drive).

Controle de quem pode criar, editar ou excluir dados, de acordo com o perfil do usuário.

Exclusão lógica de características: elas nunca são apagadas de verdade, apenas marcadas como inativas.

Como funciona a Página Pública do Ativo:
Qualquer pessoa pode acessar escaneando o QR Code.

Se o ativo estiver marcado como perdido, aparece um alerta em destaque na página.

Só aparecem na página pública as informações e características autorizadas para exibição.

Cada vez que a página é acessada, o sistema registra o acesso.

Sobre o Controle de Inventário:
O inventário é feito de forma simples:
O usuário escaneia o QR Code do ativo e registra a data como uma nova característica.
Não existe uma tabela separada só para inventário; ele é tratado como uma informação dentro do próprio ativo.

Sobre as Fotos e Anexos:
Cada ativo pode ter uma ou mais fotos associadas, armazenadas no Firebase Storage.
Também é possível adicionar links de documentos externos (como Google Drive ou Dropbox), funcionando como anexos.

Sobre a Hierarquia de Usuários:
Cada usuário pode ter um gerente.

Um gerente pode ver seus subordinados e todos os ativos deles.

Um administrador pode ver todos os usuários e ativos, sem limite.

Recursos Técnicos que serão usados:
Firebase Authentication para login seguro.

Firestore para armazenar dados de usuários, ativos, locais, fotos, anexos e logs.

Firebase Storage para guardar as fotos dos ativos.

Firebase Hosting para disponibilizar a página pública dos ativos.

Cloud Functions se necessário para tarefas automáticas (como registro de acessos).

Objetivo do QRot.io:
Melhorar o controle de ativos da empresa.

Facilitar o inventário anual.

Aumentar a chance de recuperação de ativos perdidos.

Reduzir o risco de perdas e extravios.

Oferecer um sistema simples, seguro e eficiente para gestão de patrimônio.
  