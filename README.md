# Conexão Ateliê

Painel de inscrições desenvolvido para o teste técnico de Front-End do Ateliê de Propaganda. Permite consultar participantes, buscar por nome ou e-mail, filtrar por status, visualizar detalhes e cadastrar novas inscrições.

A interface segue a estrutura das referências de desktop, celular e modal fornecidas no Figma. A importação local de CSV foi implementada como funcionalidade opcional.

## Netlify
https://ateliefront-teste.netlify.app/

## Executar localmente

Requisitos: Node.js 24 e npm. Versões utilizadas: Node 24.22.1 e npm 11.9.0.

```bash
npm ci
cp .env.example .env.local
```

Informe o código recebido por e-mail em `VITE_CANDIDATO`, no arquivo `.env.local`:

```dotenv
VITE_DEMO=false
VITE_API_URL=https://api-teste.ateliedepropaganda.com.br
VITE_CANDIDATO=seu-codigo
VITE_CENARIO=
```

```bash
npm run dev
```

Para gerar e conferir a versão de produção:

```bash
npm run build
npm run preview
```

O arquivo `.env.local` não é versionado. As variáveis `VITE_*` são incorporadas ao JavaScript no build e ficam visíveis no navegador; não devem conter credenciais privadas.

## Stack

| Responsabilidade | Tecnologia |
| --- | --- |
| Interface | React e TypeScript |
| Desenvolvimento e build | Vite |
| Estilos | Tailwind CSS e CSS com tokens visuais |
| Consultas, cache e mutações | TanStack Query |
| Validação de formulários e respostas | Zod |
| Integração HTTP | Fetch |
| Testes | Vitest, Testing Library e axe-core |

## Funcionalidades

- Indicadores de total, pendentes e aprovadas calculados sobre todas as inscrições, independentemente dos filtros.
- Busca por nome ou e-mail combinada com filtro de status.
- Listagem adaptada para desktop e celular.
- Consulta de detalhes em modal com controle de abertura, fechamento e foco.
- Cadastro com validação por campo e status inicial pendente.
- Proteção contra envios repetidos durante a requisição.
- Atualização da lista e dos indicadores após cadastro, sem recarregar a página.
- Estados distintos de carregamento, falha, lista vazia e busca sem resultados.
- Preservação dos campos em caso de falha no cadastro e tratamento específico de conflito de e-mail.

### CSV opcional

A seção de importação permanece recolhida após o painel principal. A leitura é feita no navegador, sem enviar arquivos ou registros à API.

O parser aceita BOM, CRLF, vírgulas em campos entre aspas, aspas escapadas e quebras de linha dentro dos campos. A validação reutiliza o schema do formulário e exibe prévia, mensagens por registro e totais de válidos e inválidos. E-mails duplicados no arquivo recebem um aviso separado.

Limites: 2 MB e 1.000 registros por arquivo. O exemplo fornecido contém 16 registros: 9 válidos, 7 inválidos e um aviso de duplicidade.

## Decisões técnicas

**Dados assíncronos.** A lista e os detalhes possuem consultas próprias. Após o cadastro, a invalidação do cache sincroniza a interface. As consultas aceitam cancelamento por `AbortSignal`.

**Envio do formulário.** Além do botão desabilitado, um bloqueio síncrono impede dois envios antes da próxima renderização. Não há retry automático de POST, pois uma resposta de rede ambígua pode representar um cadastro já concluído. Idempotência entre abas ou após falhas de conexão depende do backend.

**Contrato HTTP.** Todas as requisições enviam `X-Candidato`. As respostas são validadas antes do uso. O adaptador espera um array em `GET /inscricoes` e um objeto de inscrição em `GET /inscricoes/{id}` e `POST /inscricoes`.

**Componentes e estilos.** Cadastro, detalhes e importação possuem responsabilidades separadas. A interface utiliza controles nativos, tokens CSS e utilitários Tailwind, sem biblioteca adicional de componentes.

**Privacidade e performance.** Sem analytics, cookies, armazenamento persistente de participantes ou fontes externas. O CSV fica em memória. O painel é estático e não requer servidor de aplicação. A página inclui `noindex`, por se tratar de uma interface administrativa; isso não substitui autenticação.

## Acessibilidade

WCAG 2.2 nível AA foi adotada como referência de implementação, sem declaração de conformidade integral.

- HTML semântico, idioma definido, títulos, regiões e link para pular ao conteúdo.
- Tabela com legenda e cabeçalhos; rótulos e autocomplete no formulário.
- Foco visível, controles de status nativos e mensagens que não dependem apenas de cor.
- Erros associados aos campos com `aria-describedby` e `aria-invalid`, com foco no primeiro campo inválido.
- Mensagens assíncronas em regiões `status` e `alert`.
- Modal nativo com foco inicial, fechamento por Escape e retorno ao acionador.
- Adaptação para telas pequenas, cores forçadas e preferência por movimento reduzido.

A auditoria automatizada cobre semântica e atributos acessíveis. Contraste, reflow, contenção de foco no navegador e uso com leitor de tela precisam de verificação manual.

## Testes

```bash
npm test
npm run test:watch
```

Há 12 testes distribuídos entre interface, contrato HTTP e CSV:

- Validação do formulário e foco no primeiro erro.
- Busca e filtro sem alterar indicadores globais.
- Conflito de e-mail preservando os dados preenchidos.
- Recuperação após falha na consulta.
- Bloqueio de clique duplicado e atualização após cadastro.
- Verificações semânticas com axe-core.
- Header de candidato, cenário simulado e cancelamento de consulta.
- Payload de cadastro, conflito HTTP e rejeição de resposta inválida.
- Leitura do CSV oficial, contagens, campos entre aspas e erros de estrutura.

O build TypeScript/Vite foi concluído. Os 12 testes apresentaram resultados positivos, mas a execução não confirmou o encerramento normal do processo. O teste axe em jsdom não avalia contraste.

### Diagnóstico e cenários

```bash
npm run check:api
```

O diagnóstico consulta a lista e um detalhe, se disponível, sem cadastrar registros ou imprimir dados pessoais. Requer `.env.local` configurado.

Para reproduzir os estados da API, defina `VITE_CENARIO` como `lento`, `erro`, `vazio` ou `conflito`. Deixe vazio para o fluxo normal. Para executar sem a API, use `VITE_DEMO=true`: os dados fictícios ficam apenas em memória e são restaurados ao recarregar.

Alterações nas variáveis exigem reiniciar o servidor local ou gerar um novo build.

## Deploy no Netlify

O repositório inclui `netlify.toml`, com Node 24, comando `npm run build` e diretório de publicação `dist`.

### Integração com GitHub

1. Importe o repositório no Netlify.
2. Use a pasta que contém `package.json` e `netlify.toml` como diretório base. Se esses arquivos estiverem na raiz do repositório, deixe o campo de diretório base vazio.
3. Configure `VITE_CANDIDATO` nas variáveis de ambiente do Netlify, com disponibilidade durante o build. A URL oficial e o modo API já estão definidos em `netlify.toml`.
4. Publique. Ao alterar variáveis de ambiente, faça um novo deploy com build.

O `.env.local` é ignorado pelo Git e não substitui a configuração das variáveis no Netlify.

### Upload manual

A pasta `dist/` acompanha o pacote com o build configurado para a API oficial e o código informado. Para publicação manual, envie **o conteúdo de `dist/`**, com `index.html` na raiz, e não o código-fonte inteiro. Também é possível arrastar a própria pasta `dist` para a área de deploy manual do Netlify.

O deploy manual não executa build nem injeta variáveis. Para alterar a configuração, ajuste `.env.local`, rode `npm run build` e envie a nova pasta `dist`.

## Validações pendentes e próximos passos

A implementação cobre o escopo principal e o CSV opcional. Permanecem pendentes:

- Confirmar integração e contrato com a API real; a consulta de validação terminou em timeout.
- Confirmar encerramento normal da suíte de testes.
- Verificar teclado, leitor de tela, contraste, zoom e reflow em navegador real.
- Conferir o resultado publicado no Netlify, incluindo permissões de CORS da API para a origem do site.

Com mais tempo, priorizaria testes E2E dos fluxos de cadastro e foco do modal, auditoria manual de acessibilidade e validação de idempotência com o backend.

## Tempo dedicado e ferramentas de apoio

**Tempo dedicado:** 30min

Utilizei ChatGPT/Codex na análise dos requisitos, geração e revisão da implementação, testes e documentação. A verificação incluiu inspeção das referências visuais, build TypeScript/Vite e testes automatizados de interface, CSV e contrato HTTP simulado. As limitações de validação estão descritas acima.

## Organização dos componentes

- `src/App.tsx`: composição da página, aviso de cadastro e seleção do modal.
- `src/components/`: cabeçalho, indicadores, filtros, tabela, cadastro, modal, tag de status e prévia de CSV.
- `src/hooks/useInscricoes.ts`: consultas e invalidação do cache de inscrições.
- `src/hooks/useCadastro.ts`: validação, envio, erros e foco do formulário.
- `src/hooks/useCsvImport.ts`: leitura e validação local de CSV.
- `src/api.ts` e `src/csv.ts`: contratos, acesso à API e validação dos arquivos.

Os filtros ficam na lista e os totais usam todos os registros. A tag `StatusBadge` é compartilhada pela tabela e pelo modal. Os cards mobile se aplicam até 767 px; até 1013 px, o formulário fica abaixo da lista. O CSV inicia expandido. As células da tabela usam 10 px de padding vertical.
