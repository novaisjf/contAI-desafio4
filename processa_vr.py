# Autor: Leonardo Novais
# Data: 21/08/2025
# Descrição: Este script gera uma planilha excel para ser enviada a operadora para VR/VA
# Versão: 1.0
# Observações: Criado para Desafio 4 do curso

import pandas as pd
import numpy as np

def clean_cols(df):
    df.columns = [c.strip().upper() for c in df.columns]
    return df

# Carregar arquivos e Ajuste de colunas
ativos = clean_cols(pd.read_excel('ATIVOS.xlsx'))
desligados = clean_cols(pd.read_excel('DESLIGADOS.xlsx'))
afastamentos = clean_cols(pd.read_excel('AFASTAMENTOS.xlsx'))
ferias = clean_cols(pd.read_excel('FERIAS.xlsx'))
admissao_abril = clean_cols(pd.read_excel('ADMISSAO-ABRIL.xlsx'))
estagio = clean_cols(pd.read_excel('ESTAGIO.xlsx'))
exterior = clean_cols(pd.read_excel('EXTERIOR.xlsx'))

#  Base para os dias úteis
dias_uteis = pd.read_excel('Base-dias-uteis.xlsx', header=0)
dias_uteis.columns = ['SINDICATO', 'DIAS_UTEIS']

# Base para Sindicato x Valor
def clean_cols_strip(df):
    df.columns = [c.strip().upper() for c in df.columns]
    return df

sindicato_valor = pd.read_excel('Base-sindicato-x-valor.xlsx', header=0)
sindicato_valor = clean_cols_strip(sindicato_valor)


# Remover os que NÃO devem recebem beneficio: 
# Não tem direito: estagiários, aprendizes, diretores, afastados e exterior
matricula_excluir = set()
matricula_excluir |= set(estagio['MATRICULA'])
matricula_excluir |= set(exterior['CADASTRO'])
matricula_excluir |= set(afastamentos['MATRICULA'])
matricula_excluir |= set(ativos[ativos['TITULO DO CARGO'].str.contains('DIRETOR', case=False, na=False)]['MATRICULA'])
matricula_excluir |= set(ativos[ativos['TITULO DO CARGO'].str.contains('APRENDIZ', case=False, na=False)]['MATRICULA'])

df = ativos[~ativos['MATRICULA'].isin(matricula_excluir)].copy()

# Realizar integração com desligados/férias 
# Correção de nomes se necessário (obs: algumas planilhas tinham espaço na matrícula)

desligados.columns = [col.strip().upper() for col in desligados.columns]
if 'MATRICULA ' in desligados.columns:
    desligados = desligados.rename(columns={'MATRICULA ':'MATRICULA'})

df = df.merge(ferias[['MATRICULA','DIAS DE FÉRIAS']].rename(columns={'DIAS DE FÉRIAS': 'DIAS_FERIAS'}), how='left', on='MATRICULA')
df['DIAS_FERIAS'] = df['DIAS_FERIAS'].fillna(0) # Atenção: Quem não tem férias fica 0

df = df.merge(desligados[['MATRICULA','DATA DEMISSÃO','COMUNICADO DE DESLIGAMENTO']], how='left', on='MATRICULA')
df['DATA DEMISSÃO'] = pd.to_datetime(df['DATA DEMISSÃO'], errors='coerce')
df['DESLIGADO_OK'] = df['COMUNICADO DE DESLIGAMENTO'].astype(str).str.upper().eq('OK')

# Associar sindicato a estado (ajustando quando se necessário)

sind_to_estado = {
    'SINDPPD RS - SINDICATO DOS TRAB. EM PROC. DE DADOS RIO GRANDE DO SUL': 'RIO GRANDE DO SUL',
    'SINDPD RJ - SINDICATO PROFISSIONAIS DE PROC DADOS DO RIO DE JANEIRO': 'RIO DE JANEIRO',
    'SINDPD SP - SIND.TRAB.EM PROC DADOS E EMPR.EMPRESAS PROC DADOS ESTADO DE SP.': 'SÃO PAULO',
    'SITEPD PR - SIND DOS TRAB EM EMPR PRIVADAS DE PROC DE DADOS DE CURITIBA E REGIAO METROPOLITANA': 'PARANÁ',
}

df['ESTADO'] = df['SINDICATO'].map(sind_to_estado)

# Associa sindicato a dias úteis 
dias_uteis_dict = dict(zip(dias_uteis['SINDICATO'], dias_uteis['DIAS_UTEIS']))
df['DIAS_UTEIS_SINDICATO'] = df['SINDICATO'].map(dias_uteis_dict)

# Associa valor diário do VR via estado 
valor_dict = dict(zip(sindicato_valor['ESTADO'].str.upper().str.strip(), sindicato_valor['VALOR']))
df['VALOR_DIARIO_VR'] = df['ESTADO'].str.upper().str.strip().map(valor_dict)

# Cálculo dos dias de VR conforme regras de férias e desligamento 
def calc_dias(row):
    dias_uteis = int(row['DIAS_UTEIS_SINDICATO']) if pd.notnull(row['DIAS_UTEIS_SINDICATO']) else 0
    dias_ferias = int(row['DIAS_FERIAS']) if pd.notnull(row['DIAS_FERIAS']) else 0
    deslig_data = row['DATA DEMISSÃO']
    deslig_ok = row['DESLIGADO_OK']
    if pd.notnull(deslig_data):

        # Desligamento até dia 15 e OK: não paga VR
        if deslig_ok and deslig_data.day <= 15 and deslig_data.month == 5 and deslig_data.year == 2025:
            return 0
        # Desligamento após dia 15 e OK: paga até a data
        elif deslig_ok and deslig_data.month == 5 and deslig_data.year == 2025:
            return deslig_data.day
        else:
            return dias_uteis  # Compra integral se não tiver OK ou for em outro mês
    return max(0, dias_uteis - dias_ferias)

df['DIAS_VR'] = df.apply(calc_dias, axis=1)

# Cálculo dos valores

df['VR_TOTAL'] = df['DIAS_VR'] * df['VALOR_DIARIO_VR']
df['VR_EMPRESA'] = df['VR_TOTAL'] * 0.8
df['VR_COLABORADOR'] = df['VR_TOTAL'] * 0.2

# Gerar arquivo final

df_final = df[['MATRICULA','ESTADO','SINDICATO','DIAS_VR','VALOR_DIARIO_VR','VR_TOTAL','VR_EMPRESA','VR_COLABORADOR']]
df_final.rename(columns={
    'MATRICULA':'Matricula',
    'ESTADO':'Estado',
    'SINDICATO':'Sindicato do Colaborador',
    'DIAS_VR':'Dias',
    'VALOR_DIARIO_VR':'Valor Diário VR',
    'VR_TOTAL':'Total',
    'VR_EMPRESA':'Custo empresa',
    'VR_COLABORADOR':'Desconto profissional',
}, inplace=True)
df_final.to_excel('VR-CALCULO-FINAL.xlsx', index=False)

print('Arquivo Gerado com Sucesso: VR-CALCULO-FINAL.xlsx')



