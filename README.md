# Trilha MPMA

Aplicação estática para preparação de TI: 227 tópicos em 15 disciplinas, cronograma de 12 semanas, checklist original de 92 itens, revisões em 1/7/30 dias, notas, videoaulas e registro de questões.

## Uso

Abra https://pedrosetti.github.io/trilha-mpma/ ou sirva os arquivos com um servidor HTTP estático. Não há etapa de build.

A referência de prazo é fevereiro de 2027, com dia a confirmar, e pode ser ajustada na interface. Os temas e a distribuição histórica reproduzem material preparatório enviado pelo usuário, não o edital de um novo concurso. Alguns assuntos têm aula selecionada; os outros disponibilizam uma busca específica do YouTube e permitem salvar o vídeo escolhido.

## Dados

O progresso fica em localStorage sob a chave trilha-mpma-v1. Os IDs dos itens do cronograma e do checklist original permanecem os mesmos. O programa ampliado tem IDs próprios e mantém acompanhamento separado. Exporte/importe JSON para fazer backup ou trocar de navegador.

## Conteúdo

- data.js: cronograma e checklist originais.
- program.js: 227 tópicos da lista ampliada, com disciplina, área e semana sugerida.
- expansion.js: prazo, visão de disciplinas, referências e roteiros de estudo.
- app.js: interação, progresso, revisões, vídeos, busca e resultados.
