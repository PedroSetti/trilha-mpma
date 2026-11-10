const learningSources={
 language:['Portal de recursos linguísticos do Senado','https://www12.senado.leg.br/manualdecomunicacao'],
 math:['Portal da Matemática — OBMEP/IMPA','https://portaldaobmep.impa.br/'],
 constitution:['Constituição Federal — Senado','https://www25.senado.leg.br/web/atividade/legislacao/constituicao-federal'],
 law:['Legislação federal — Câmara dos Deputados','https://www2.camara.leg.br/atividade-legislativa/legislacao'],
 mp:['Legislação institucional — MPMA','https://www.mpma.mp.br/'],
 services:['ITIL — PeopleCert','https://www.peoplecert.org/browse-certifications/it-governance-and-service-management/ITIL-1'],
 governance:['COBIT — ISACA','https://www.isaca.org/resources/cobit'],
 programming:['Tutorial Python — documentação oficial','https://docs.python.org/pt-br/3/tutorial/'],
 web:['Aprendendo desenvolvimento web — MDN','https://developer.mozilla.org/pt-BR/docs/Learn_web_development'],
 network:['Conceitos de redes — Cisco','https://www.cisco.com/site/us/en/learn/topics/networking/what-is-computer-networking.html'],
 windows:['Documentação Windows — Microsoft Learn','https://learn.microsoft.com/pt-br/windows/'],
 linux:['Documentação Ubuntu','https://help.ubuntu.com/'],
 security:['Guias e publicações de segurança — NIST','https://csrc.nist.gov/publications'],
 database:['Tutorial SQL — PostgreSQL','https://www.postgresql.org/docs/current/tutorial-sql.html'],
 cloud:['Fundamentos de nuvem — Microsoft Learn','https://learn.microsoft.com/pt-br/training/paths/azure-fundamentals-describe-cloud-concepts/'],
 office:['Suporte Microsoft 365','https://support.microsoft.com/pt-br/microsoft-365'],
 health:['Primeiros socorros — SAMU Ceará','https://www.samu.ce.gov.br/primeiros-socorros/'],
 city:['Imperatriz — IBGE','https://www.ibge.gov.br/cidades-e-estados/ma/imperatriz.html'],
 geography:['Brasil em Síntese — IBGE','https://brasilemsintese.ibge.gov.br/'],
 archive:['Gestão de documentos — Arquivo Nacional','https://www.gov.br/arquivonacional/pt-br'],
 social:['Direitos e deveres — INSS','https://www.gov.br/inss/pt-br/direitos-e-deveres'],
 pc:['Normas aplicáveis — Polícia Civil do Maranhão','https://www.policiacivil.ma.gov.br/informativos/coletanea-de-normas-aplicaveis/leis-estaduais-2/'],
 traffic:['Legislação de trânsito — SENATRAN','https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-Senatran/legislacao'],
 prf:['Institucional — PRF','https://www.gov.br/prf/pt-br/acesso-a-informacao/institucional'],
 rights:['Direitos humanos — MDHC','https://www.gov.br/mdh/pt-br'],
 english:['LearnEnglish — British Council','https://learnenglish.britishcouncil.org/'],
 spanish:['Diccionario — Real Academia Española','https://dle.rae.es/']
};
function teachingTheme(chapter){const s=String(chapter.category+' '+chapter.title).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(/imperatriz/.test(s))return {photo:'city',diagram:'city',sources:['city','law'],labels:['Território e história','Norma municipal','Fonte oficial e data']};
 if(/primeiros socorros/.test(s))return {photo:'health',diagram:'health',sources:['health'],labels:['Cena segura','Ligar 192','Seguir orientação']};
 if(/lingua inglesa/.test(s))return {photo:'books',diagram:'language',sources:['english'],labels:['Texto e contexto','Estrutura da frase','Sentido demonstrável']};
 if(/lingua espanhola/.test(s))return {photo:'books',diagram:'language',sources:['spanish'],labels:['Texto e contexto','Estrutura da frase','Sentido demonstrável']};
 if(/portugues|linguistic|redacao/.test(s))return {photo:'books',diagram:'language',sources:['language'],labels:['Leia o enunciado','Observe a estrutura','Justifique pelo texto']};
 if(/fisica/.test(s))return {photo:'books',diagram:'physics',sources:['math'],labels:['Defina as grandezas','Aplique a relação','Confira as unidades']};
 if(/logico|matematic/.test(s))return {photo:'books',diagram:'math',sources:['math'],labels:['Hipóteses e valores','Regra ou operação','Teste a conclusão']};
 if(/previdenci|seguridade|inss/.test(s))return {photo:'law',diagram:'law',sources:['social','constitution','law'],labels:['Regime e data','Requisitos do benefício','Prova e cálculo']};
 if(/transito|rodovi/.test(s))return {photo:'city',diagram:'road',sources:['traffic','prf'],labels:['Conduta e contexto','Regra aplicável','Competência e processo']};
 if(/policia civil|lei 6.107/.test(s))return {photo:'law',diagram:'law',sources:['pc','constitution'],labels:['Constituição','Lei estadual','Procedimento aplicável']};
 if(/ministerio publico|mp-ma/.test(s))return {photo:'law',diagram:'law',sources:['mp','constitution','law'],labels:['Constituição','Norma orgânica','Atribuição do órgão']};
 if(/direito|legislacao|guarda|criminolog|etica/.test(s))return {photo:'law',diagram:'law',sources:['constitution','law'],labels:['Fato e norma','Requisitos e limites','Conclusão fundamentada']};
 if(/direitos humanos|protecao social|relacoes humanas/.test(s))return {photo:'books',diagram:'people',sources:['rights','constitution'],labels:['Pessoa e necessidade','Direitos e barreiras','Atendimento respeitoso']};
 if(/arquiv/.test(s))return {photo:'books',diagram:'archive',sources:['archive'],labels:['Produção e contexto','Tramitação e avaliação','Guarda ou destinação']};
 if(/geopolit|meio ambiente/.test(s))return {photo:'city',diagram:'city',sources:['geography','law'],labels:['Território e escala','Processos e impactos','Fonte, data e análise']};
 if(/banco de dados|sql|bcnf|data warehouse/.test(s))return {photo:'hardware',diagram:'database',sources:['database'],labels:['Modelo e restrições','Consulta ou transação','Resultado e integridade']};
 if(/seguranca da inform|privacidade|criptograf|lgpd|inteligencia artificial/.test(s))return {photo:'network',diagram:'security',sources:['security','law'],labels:['Ativo e risco','Controle adequado','Verificar e melhorar']};
 if(/hardware|manutencao|suporte tecnico/.test(s))return {photo:'hardware',diagram:'computer',sources:['windows'],labels:['Sintoma e contexto','Teste controlado','Verificar e registrar']};
 if(/redes de computadores|switch|stp|ldap|ntp/.test(s))return {photo:'network',diagram:'network',sources:['network'],labels:['Aplicação e transporte','Rede e enlace','Meio físico']};
 if(/sistemas operacionais|windows|linux/.test(s))return {photo:'hardware',diagram:'computer',sources:[/linux/.test(s)?'linux':'windows'],labels:['Aplicações','Sistema operacional','Hardware e recursos']};
 if(/nuvem|infraestrutura|devops/.test(s))return {photo:'network',diagram:'cloud',sources:['cloud'],labels:['Usuário e aplicação','Serviço e capacidade','Estado e recuperação']};
 if(/governanca|gestao de ti/.test(s))return {photo:'network',diagram:'management',sources:['governance','services'],labels:['Direcionar e planejar','Executar o serviço','Medir e melhorar']};
 if(/informatica para concursos/.test(s))return {photo:'hardware',diagram:'computer',sources:['office'],labels:['Entrada e conteúdo','Ferramenta e operação','Saída e verificação']};
 if(/administracao publica/.test(s))return {photo:'law',diagram:'management',sources:['constitution','law'],labels:['Planejar e organizar','Dirigir e executar','Controlar resultados']};
 if(/programacao|algoritmo|software|interfaces|solid/.test(s))return {photo:'hardware',diagram:'code',sources:['programming','web'],labels:['Entrada e contrato','Regra e implementação','Saída e teste']};
 return {photo:'books',diagram:'book',sources:['law'],labels:['Conceito e contexto','Aplicação do conteúdo','Verificação da resposta']}}
function teachingDiagram(chapter,theme){const labels=theme.labels;const icon=({network:'◎ — ▣ — ◎',database:'ID → TABELA ← CHAVE',math:'p → q     •     2 × 3 = 6',physics:'F = m × a',language:'TEXTO → ESTRUTURA → SENTIDO',health:'SEGURANÇA → 192 → ORIENTAÇÃO',law:'CONSTITUIÇÃO → LEI → ATO',code:'ENTRADA → PROCESSAMENTO → SAÍDA',security:'RISCO → CONTROLE → EVIDÊNCIA',cloud:'CLIENTE ⇄ SERVIÇO ⇄ DADOS',computer:'CPU ⇄ RAM ⇄ ARMAZENAMENTO',management:'PLANEJAR → EXECUTAR → AVALIAR',archive:'PRODUZIR → AVALIAR → DESTINAR',people:'DIGNIDADE • IGUALDADE • PROTEÇÃO',road:'REGRA → CONDUTA → RESPONSABILIDADE',city:'ESPAÇO • TEMPO • CONEXÕES',book:'LER → COMPREENDER → EXPLICAR'})[theme.diagram];
 return `<figure class="teaching-diagram"><svg role="img" aria-label="${esc(labels.join(' → '))}" viewBox="0 0 700 170" xmlns="http://www.w3.org/2000/svg"><rect width="700" height="170" rx="16" fill="#edf3eb"/><text x="350" y="35" text-anchor="middle" fill="#244e42" font-size="16" font-family="Arial">${esc(icon)}</text>${labels.map((label,i)=>`<rect x="${20+i*230}" y="65" width="210" height="65" rx="10" fill="white" stroke="#abc2b5"/><text x="${125+i*230}" y="102" text-anchor="middle" fill="#244e42" font-size="13" font-family="Arial">${esc(label)}</text>${i<2?`<path d="M${234+i*230} 98h12m-4-4 4 4-4 4" fill="none" stroke="#244e42"/>`:''}`).join('')}</svg><figcaption>Mapa da disciplina: use esta sequência para organizar o raciocínio. O exemplo resolvido do capítulo mostra a aplicação concreta.</figcaption></figure>`}
function teachingHTML(topic){const ids=LEARNING_UNITS[topic.id]||[],chapters=ids.map(id=>LEARNING_CHAPTERS[id]);if(!chapters.length)return '';const theme=teachingTheme(chapters[0]),photo=LEARNING_PHOTOS[theme.photo];return `<section id="lesson-theory" class="teaching"><div class="teaching-heading"><span class="eyebrow">APRENDA DO ZERO</span><h3>A aula, explicada por escrito.</h3><p>Leia uma ideia por vez. Tente o exercício antes de abrir a resposta e, no fim, explique o assunto com suas palavras.</p></div>${chapters.length>1?`<p class="teaching-count">Este bloco reúne ${chapters.length} capítulos. Abra o assunto que deseja estudar agora.</p>`:''}${chapters.map((chapter,i)=>{const t=teachingTheme(chapter);return `<details class="teaching-chapter" ${i===0?'open':''}><summary><span>${String(i+1).padStart(2,'0')}</span> ${esc(chapter.title)}</summary><div class="teaching-body"><h4>1. A ideia básica</h4><p>${esc(chapter.simple)}</p><h4>2. Aprofundando a teoria</h4><p>${esc(chapter.advanced)}</p><aside class="teaching-warning"><strong>Erro comum</strong><p>${esc(chapter.pitfall)}</p></aside><div class="teaching-practice"><h4>3. Agora, aplique</h4><p>${esc(chapter.problem)}</p><details class="teaching-answer"><summary>Conferir a resposta explicada</summary><p>${esc(chapter.answer)}</p></details></div><div class="teaching-recall"><strong>4. Ensine de volta</strong><p>Sem olhar, explique a ideia para alguém que nunca estudou isso. Use o exemplo acima, diga por que a resposta funciona e anote a dúvida que restou.</p></div><details class="teaching-sources"><summary>Fontes oficiais para aprofundar</summary><ul>${t.sources.map(key=>{const [name,url]=learningSources[key];return `<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(name)} ↗</a></li>`}).join('')}</ul><p>Material autoral de apoio. Em legislação, confira o texto consolidado e a data de corte do edital. Referências históricas estão identificadas; este resumo não substitui a norma integral.</p></details></div></details>`}).join('')}<details class="teaching-visuals"><summary>Imagem, foto de referência e mapa da disciplina</summary>${teachingDiagram(chapters[0],theme)}<figure><img loading="lazy" src="${photo.src}" alt="${esc(photo.alt)}" width="960" height="650"><figcaption>${esc(photo.caption)}<br>Foto: ${esc(photo.artist)} · <a href="${esc(photo.source)}" target="_blank" rel="noopener noreferrer">Fonte no Wikimedia Commons</a> · <a href="${esc(photo.licenseUrl)}" target="_blank" rel="noopener noreferrer">${esc(photo.license)}</a>. ${esc(photo.changed)}</figcaption></figure></details></section>`}
