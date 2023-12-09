# API de Cadastro de Produtos

Desenvolvi uma api para satisfazer os requisitos de um trabalho para a segunda etapa da materia de backend da faculdade de Analise e Desenvolvimento de Sistemas usando as praticas aprendidas em sala

## Tecnologias Utilizadas

- TypeScript
- Express
- Knex

## Endpoints

### Usuario

- **POST /signup**: Cria um usuario.
- **POST /login**: Gera Token de Authenticação.

### Tipo de Produto

- **POST /type_products**: Cria um novo tipo de produto.
- **GET /type_products**: Busca todos os tipos de produtos.
- **PUT /type_products/:id**: Atualiza um tipo de produto existente pelo ID.
- **DELETE /type_products/:id**: Exclui um tipo de produto pelo ID.

### Produto

- **POST /produto**: Cria um novo produto.
- **GET /produto**: Busca todos os produtos.
- **PUT /produto/:id**: Atualiza um produto existente pelo ID.
- **DELETE /produto/:id**: Exclui um produto pelo ID.

## Como Executar

1. Clone este repositório
2. Instale as dependências com `npm install`
3. Inicie o servidor com `npm start`

Visite `localhost:3000` no seu navegador para ver a API em ação.

