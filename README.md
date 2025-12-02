================================
================================
====
MURAL DE RECADOS - AVALIAÇÃO
FINAL
DESCRIÇÃO
Este projeto é uma aplicação web "Single Page Application" (SPA)
que funciona como um mural de recados público. Permite criar,
ler, atualizar, excluir (CRUD) e favoritar recados.
TECNOLOGIAS UTILIZADAS
[Front-end]
● HTML5
● CSS3 (Framework: Bootstrap 5 + Estilos customizados)
● JavaScript (ES6+ com Fetch API)
[Back-end]
● PHP 7.4+ (Orientado a Objetos)
● MySQL (Banco de dados)
================================
================================
==== MANUAL DE INSTALAÇÃO (PASSO
A PASSO)
PRÉ-REQUISITOS
Para rodar este projeto, você precisa de um servidor web com suporte
a PHP e um banco de dados MySQL. Recomendamos o uso do XAMPP.
PASSO 1: INSTALAÇÃO DO XAMPP
1. Baixe e instale o XAMPP (https://www.apachefriends.org/pt_br/index.html).
2. Abra o "XAMPP Control Panel".
3. Inicie os módulos "Apache" e "MySQL" clicando no botão "Start".
(Eles devem ficar com a cor verde no painel).
PASSO 2: CONFIGURAÇÃO DO BANCO DE DADOS
1. Com o XAMPP rodando, acesse no seu navegador: http://localhost/phpmyadmin
2. Clique em "Novo" (ou "Databases") no menu superior.
3. Em "Nome do banco de dados", digite: trabalho_web
4. Selecione a codificação "utf8mb4_general_ci" e clique em "Criar".
5. Selecione o banco criado na lateral esquerda.
6. Vá na aba "SQL" no topo da tela, cole o código abaixo e clique em "Executar":
CREATE TABLE recados (
id INT PRIMARY KEY AUTO_INCREMENT,
mensagem TEXT NOT NULL,
status TINYINT(1) NOT NULL DEFAULT 0,
data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
PASSO 3: INSTALAÇÃO DOS ARQUIVOS (HTDOCS)
O PHP precisa ser executado pelo servidor Apache. Por isso, não podemos
apenas abrir o arquivo .html direto da pasta.
1. Localize a pasta de instalação do XAMPP.
Geralmente fica em: C:\xampp
2. Dentro dela, encontre a pasta chamada "htdocs".
Caminho completo: C:\xampp\htdocs
(Esta é a pasta pública do seu servidor local).
3. Crie uma nova pasta dentro de "htdocs" para o projeto.
Exemplo: C:\xampp\htdocs\mural
4. Copie TODOS os 7 arquivos do projeto para dentro desta nova pasta:
○ index.html
○ style.css
○ script.js
○ api.php
○ config.php
○ Database.php
○ Recado.php
5. (Opcional) Se você alterou a senha do root do MySQL no XAMPP,
edite o arquivo 'config.php' com sua nova senha.
================================
================================
====
COMO EXECUTAR
1. Certifique-se que o Apache e MySQL estão rodando no XAMPP.
2. Abra seu navegador (Chrome, Firefox, Edge).
3. Acesse o endereço correspondente à pasta que você criou no htdocs:
http://localhost/mural/index.html
(Se você deu outro nome à pasta no passo 3 da instalação,
use http://localhost/NOME_DA_SUA_PASTA/)
IMPORTANTE: Não use extensões como "Live Server" do VS Code, pois elas
não processam PHP. Use sempre o endereço "localhost" no navegador.
================================
================================
==== ESTRUTURA DE ARQUIVOS
├── index.html # Página principal (Interface do usuário)
├── style.css # Estilos visuais e correções do Bootstrap
├── script.js # Lógica do cliente (faz as chamadas para a API)
├── api.php # Ponto de entrada da API (recebe as requisições JS)
├── config.php # Configurações de acesso ao banco de dados
├── Database.php # Classe de conexão com o MySQL (PDO)
└── Recado.php # Classe Modelo com as regras de negócio (CRUD)
