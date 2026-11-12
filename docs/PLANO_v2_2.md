# ConfeiPro v2.2 — plano de melhorias

Objetivo: corrigir erros reproduzíveis e melhorar celular e PC, preservando HTML/CSS/JS, marca e dados existentes.

- [x] Reproduzir abertura incorreta, consumo de ingredientes por porção, compras duplicadas e conversão de estoque em backup.
- [x] Escrever testes de regressão antes de corrigir as regras.
- [x] Corrigir navegação e cálculos mantendo o rendimento cadastrado como referência.
- [x] Melhorar campos estreitos, duas colunas no desktop, navegação por teclado e sobreposição de diálogos.
- [x] Manter HTML e scripts da mesma versão no cache offline.
- [x] Verificar seis áreas em seis larguras com viewport de iframe e executar suíte Node.
- [ ] Publicar arquivos e verificar a implantação no GitHub Pages.

Decisão de implementação: evoluir a arquitetura atual. Migrar de framework não resolve os erros encontrados e acrescentaria dependências desnecessárias. Limites: sem servidor ou sincronização entre aparelhos, sem migração de estoque histórico já descontado incorretamente, sem declarar testes em dispositivos físicos.
