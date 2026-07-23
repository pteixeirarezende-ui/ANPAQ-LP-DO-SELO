# ANPAQ — Selo Nacional da Cachaça de Alambique

Este é o projeto front-end estático (Landing Page) para o Selo Nacional da Cachaça de Alambique. 

## Estrutura de Pastas e Arquivos

O projeto foi organizado seguindo os padrões modernos e limpos do mercado de front-end:

- `index.html` — O arquivo HTML principal da Landing Page. Ele contém toda a estrutura e as marcações, separadas logicamente por seções comentadas (Hero, Educativa, O Selo, Sobre).
- `assets/` — Pasta contendo todos os recursos estáticos.
  - `assets/css/main.css` — A folha de estilo única do projeto. Utiliza variáveis CSS (`:root`) para o design system (cores, tipografia, bordas) e funções responsivas nativas (`clamp()`). Não requer pré-processadores.
  - `assets/js/main.js` — Lógica JavaScript. Responsável pelo *IntersectionObserver* que controla as animações sutis de aparecimento (reveal), o contador numérico dinâmico e o scroll suave (âncoras).
  - `assets/img/` — As imagens e recursos visuais utilizados. (Ícones menores foram inseridos inline via SVG no HTML para máxima performance).

## Informações de Implementação

1. **Responsividade Garantida:** 
   O CSS foi desenvolvido com `clamp()` e Flexbox/CSS Grid. O layout é totalmente adaptável do mobile (~320px) a monitores de alta resolução. O grid Bento foi projetado especificamente para empilhar no mobile e expandir graciosamente no desktop.
2. **Sem Dependências:**
   Este projeto não utiliza Bootstrap, Tailwind ou bibliotecas JS de terceiros (como jQuery ou bibliotecas de animação pesadas). Tudo foi feito em Vanilla HTML/CSS/JS visando alta performance e tempo de carregamento zero.
3. **Imagens e Fallbacks:**
   A maioria das chamadas de imagem possui tratamento `onerror` com fallbacks integrados, mas sugere-se revisar os caminhos para o ambiente de produção local/hospedagem, caso os assets não carreguem. 
4. **Fontes:**
   Utiliza Google Fonts (`Inter` e `Playfair Display`), já carregadas no topo do HTML com `preconnect` para melhoria de *Core Web Vitals*.

## Como rodar localmente

Não é necessário nenhum build de node (npm) ou bundlers.
Basta abrir o `index.html` no seu navegador ou rodar um servidor de desenvolvimento leve (como a extensão Live Server do VS Code) na raiz do projeto.

Boas implementações!
