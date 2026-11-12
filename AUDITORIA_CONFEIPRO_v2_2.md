# ConfeiPro — análise e melhorias v2.2

Data: 12/11/2026. Aplicação: https://jogoiarexx-blip.github.io/confeipro/

## Resultado

A base já possui receitas, precificação, produtos, pedidos, clientes, estoque, backups locais, tema escuro e PWA. O trabalho desta versão priorizou erros que alteravam resultados e dificuldades de uso em celular e computador. A identidade visual e a arquitetura modular em HTML/CSS/JavaScript foram preservadas.

Esta é uma auditoria do código e de cenários específicos da interface. Não é uma certificação de todos os fluxos comerciais nem um teste em aparelhos físicos.

## Problemas encontrados e correções

| Prioridade | Antes | Depois |
|---|---|---|
| Alta | A baixa de ingredientes multiplicava a receita inteira pela quantidade de porções vendidas. | Consumo proporcional: quantidade vendida / rendimento do produto. |
| Alta | Lista de compras usava a mesma multiplicação incorreta. | Demanda calculada pela fração de receita necessária. |
| Alta | Pedido com estoque já baixado continuava gerando demanda de compra. | Pedidos baixados são excluídos dessa demanda; estoque mínimo permanece considerado. |
| Alta | Backup de ingrediente em kg/L convertia o pacote, mas mantinha estoque e mínimo na unidade antiga. | Quantidade comprada, estoque e mínimo são convertidos juntos para g/ml. |
| Média | URL sem parâmetro era convertida em tab=0 por Number(null), abrindo Receitas enquanto o menu marcava Início. | Sem parâmetro, parâmetro vazio ou inválido abrem Início; atalhos 0 a 5 continuam funcionando. |
| Média | Modal tinha z-index 300, abaixo da navegação mobile 800 e da atualização 1200. | Modal acima desses controles, fundo bloqueado e foco dentro do diálogo. |
| Média | Navegação lateral em divs não era acessível por Tab/Enter. | Botões reais, foco visível e indicação da página ativa. |
| Média | Menu fechado ainda podia receber foco; Escape não fechava a gaveta. | Menu fechado fica inerte no mobile; abertura move foco e Escape devolve ao acionador. |
| Média | Campos de data ultrapassavam a tela estreita. | Grid com largura mínima zero; campos em coluna única até 380 px e datas com largura limitada. |
| Média | Todas as telas ficavam limitadas a 600 px no desktop. | Área até 1080 px; Pedidos e Clientes com cadastro e lista lado a lado acima de 900 px. |
| Média | PWA buscava HTML novo pela rede e scripts antigos pelo cache. | HTML e arquivos essenciais vêm do mesmo cache de versão; atualização completa é ativada pelo botão. |
| Baixa | Manifesto forçava orientação retrato. | Orientação livre, com layout horizontal disponível. |

Exemplo reproduzido: receita com 240 g de farinha, rendimento 12, pedido de 3 porções. Antes, o app calculava 720 g; agora calcula 60 g. Com saldo inicial de 100 g, a baixa deixa 40 g. Segunda baixa do mesmo pedido não repete o desconto.

As correções não recalculam baixas antigas já realizadas. Conferir o saldo físico e ajustar o estoque cadastrado quando houver histórico afetado.

## Melhorias de interface

- Menu de celular preserva logo e acesso a todas as áreas.
- Rótulos dos formulários associados aos campos; 43 associações presentes no HTML verificado.
- Link para pular a navegação, avisos anunciados por leitores de tela e diálogo identificado semanticamente.
- Confirmação começa em Cancelar, mantém Tab/Shift+Tab no diálogo e restaura o foco ao fechar.
- Textos longos quebram linha; cabeçalhos e indicadores de estoque se adaptam à largura.
- Campos com fonte de 16 px no celular para reduzir zoom automático em formulários.
- Área inferior reservada à navegação e botão flutuante; botão flutuante fica oculto enquanto o aviso de atualização aparece.
- Respeito à preferência de movimento reduzido e às áreas seguras da tela.

## Validação executada

Comando: `node --test tests/*.test.cjs`.

Resultado: **9 testes aprovados, zero falhas**. Os cinco testes iniciais falharam na versão original pelos motivos esperados e passaram após a correção.

| Teste automatizado | Resultado |
|---|---|
| Abertura padrão e parâmetros de navegação | Aprovado |
| Compras proporcionais ao rendimento | Aprovado |
| Pedido já baixado não volta à demanda | Aprovado |
| Baixa proporcional e proteção contra repetição | Aprovado |
| Backup em kg converte pacote, saldo e mínimo | Aprovado |
| Cancelados ignorados e estoque mínimo respeitado | Aprovado |
| Compatibilidade com rendimento ausente | Aprovado |
| Backup em litros converte saldo e mínimo | Aprovado |
| Worker serve HTML/scripts da mesma versão sem depender da rede | Aprovado |

Verificação sintática dos arquivos JavaScript com `node --check`; diferenças verificadas com `git diff --check`.

Interface verificada em viewports de iframe de 320×740, 360×800, 768×700, 1024×600, 1366×768 e 844×390. As seis áreas foram abertas nesses tamanhos. A largura total do documento não excedeu a largura disponível nos 36 cenários medidos após os ajustes. Há redução da largura útil quando o navegador exibe barra de rolagem vertical.

Também conferidos: abertura/fechamento do menu, Escape, confirmação sem executar exclusão, navegação cíclica de foco no diálogo e alternância para tema escuro. A conferência não mediu Lighthouse, uso de bateria, VoiceOver/TalkBack, teclado virtual real nem instalação em Android/iOS. O funcionamento sem rede foi testado na lógica do worker; modo avião em aparelho físico permanece pendente.

## Pendências e próximos passos

| Prioridade | Pendência | Próxima melhoria recomendada |
|---|---|---|
| Alta | Dados dependem do armazenamento do navegador; JSON.parse sem recuperação pode interromper a inicialização se o conteúdo estiver corrompido. | Leitura tolerante a falhas, quarentena do conteúdo e recuperação de backup sem sobrescrever dados silenciosamente. |
| Alta | Importação valida ingredientes, mas ainda não valida profundamente pedidos, produtos e identificadores usados em handlers HTML. | Validar esquema completo, limites e IDs antes de substituir dados; trocar handlers dinâmicos por eventos com IDs seguros. |
| Alta | Editar/cancelar/excluir um pedido depois da baixa não reconcilia automaticamente o estoque. | Livro de movimentos com estorno e consumo por versão do pedido. |
| Média | Saldo insuficiente é limitado a zero, sem representar a falta. | Aviso de insuficiência e registro da diferença de consumo. |
| Média | Dashboard chama de faturado o total de pedidos não cancelados, incluindo orçamentos. | Separar orçamento, venda confirmada, recebimentos e saldo a receber. |
| Média | Cópias automáticas compartilham o armazenamento do app; não são cópias externas e não incluem todas as configurações da receita. | Backup completo e restauração transacional, com cópia anterior preservada. |
| Média | Não há sincronização entre celular e PC. | Projetar conta e servidor, resolução de conflitos e exportação antes de implementar sincronização. |
| Média | Clientes e produtos usam buscas lineares em renderizações, que podem ficar lentas com muitos registros. | Ensaios com milhares de pedidos e índices por ID; paginação apenas quando a medição justificar. |
| Baixa | Fontes externas não são essenciais ao funcionamento, mas podem variar offline. | Hospedar fontes localmente ou usar apenas fontes do sistema. |

## Atualização

Versão visual v2.2 e cache confeipro-v22. A versão de migração de dados foi mantida em 21, pois esta entrega não adiciona receitas padrão nem altera o esquema persistido. Nenhuma nova dependência de execução foi adicionada. Na aplicação instalada, usar “Verificar atualização” e depois “Atualizar agora” quando o aviso aparecer; não é necessário limpar os dados do navegador.
