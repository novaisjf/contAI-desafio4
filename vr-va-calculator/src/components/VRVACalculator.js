import React, { useState, useCallback } from 'react';
import { Upload, Download, Play, CheckCircle, FileText, Utensils, Coffee, Calendar, TrendingUp, Users, Calculator } from 'lucide-react';

const VRVACalculator = () => {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadLink, setDownloadLink] = useState('');
  
  // Função para calcular mês de competência baseado na data atual
  const getCompetenciaMonth = () => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    
    // Se estamos no início do mês (primeiros 15 dias), usa mês anterior
    // Caso contrário, usa o mês atual
    const competenciaDate = now.getDate() <= 15 
      ? new Date(currentYear, currentMonth - 1) 
      : new Date(currentYear, currentMonth);
    
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return `${months[competenciaDate.getMonth()]} ${competenciaDate.getFullYear()}`;
  };

  // Dados atuais
  const [currentData] = useState({
    mesCompetencia: getCompetenciaMonth(),
    percentualProcessamento: 75
  });

  // Valores calculados pelo agente
  const [valoresCalculados, setValoresCalculados] = useState({
    qtdColaboradores: 0,
    valorTotal: 'R$ 0,00',
    valorEmpresa: 'R$ 0,00',
    valorColaborador: 'R$ 0,00'
  });

  // Histórico mockado
  const [historico] = useState([
    {
      mes: 'Novembro 2024',
      admitidos: 45,
      desligados: 12,
      valorAdmitidos: 'R$ 15.750,00',
      valorDemitidos: 'R$ 4.200,00',
      valorTotal: 'R$ 19.950,00',
      valorEmpresa: 'R$ 14.962,50',
      valorColaborador: 'R$ 4.987,50'
    },
    {
      mes: 'Outubro 2024',
      admitidos: 38,
      desligados: 8,
      valorAdmitidos: 'R$ 13.300,00',
      valorDemitidos: 'R$ 2.800,00',
      valorTotal: 'R$ 16.100,00',
      valorEmpresa: 'R$ 12.075,00',
      valorColaborador: 'R$ 4.025,00'
    },
    {
      mes: 'Setembro 2024',
      admitidos: 52,
      desligados: 15,
      valorAdmitidos: 'R$ 18.200,00',
      valorDemitidos: 'R$ 5.250,00',
      valorTotal: 'R$ 23.450,00',
      valorEmpresa: 'R$ 17.587,50',
      valorColaborador: 'R$ 5.862,50'
    }
  ]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartProcessing = async () => {
    setIsProcessing(true);
    
    // Aqui você faria a chamada para seu agente N8N
    try {
      // Exemplo de como fazer a integração com N8N:
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch('https://http://localhost:5678/workflow/2am3FvgJg0qC6y0x/4157eb/webhook/vr-va-processing', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        setValoresCalculados({
          qtdColaboradores: result.qtdColaboradores,
          valorTotal: result.valorTotal,
          valorEmpresa: result.valorEmpresa,
          valorColaborador: result.valorColaborador
        });
        setDownloadLink(result.downloadLink);
      }
    
      
      // Simulação do processamento
      console.log('Enviando arquivos para processamento N8N...', files);
      
      setTimeout(() => {
        // Simula valores calculados pelo agente
        setValoresCalculados({
          qtdColaboradores: 187,
          valorTotal: 'R$ 65.450,00',
          valorEmpresa: 'R$ 49.087,50',
          valorColaborador: 'R$ 16.362,50'
        });
        
        setDownloadLink('https://exemplo.com/base-consolidada.xlsx');
        console.log('Processamento concluído! Link de download disponível.');
      }, 3000);
      
    } catch (error) {
      console.error('Erro no processamento:', error);
      setIsProcessing(false);
    }
  };

  const handleFinishProcessing = async () => {
    // Aqui você confirmaria o processamento no N8N
    try {
      /*
      await fetch('https://seu-n8n-webhook.com/vr-va-finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          downloadLink: downloadLink,
          processId: 'algum-id-do-processo',
          valoresCalculados: valoresCalculados
        })
      });
      */
      
      console.log('Finalizando processamento...');
      
      setIsProcessing(false);
      setFiles([]);
      setDownloadLink('');
      
      // Reset valores calculados
      setValoresCalculados({
        qtdColaboradores: 0,
        valorTotal: 'R$ 0,00',
        valorEmpresa: 'R$ 0,00',
        valorColaborador: 'R$ 0,00'
      });
      
      // Aqui você atualizaria a tabela com os novos dados
      console.log('Processamento concluído e dados atualizados!');
      
    } catch (error) {
      console.error('Erro ao finalizar processamento:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fadeIn">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Utensils className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">Cálculo de VR e VA</h1>
            <div className="p-3 bg-blue-100 rounded-full">
              <Coffee className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <p className="text-lg text-gray-600">Sistema automatizado para cálculo de Vale Refeição e Vale Alimentação</p>
        </div>

        {/* Cards de Informações Atuais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800">Mês de Competência</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">{currentData.mesCompetencia}</p>
            <p className="text-sm text-gray-500 mt-2">Calculado automaticamente</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-800">Percentual de Processamento</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${currentData.percentualProcessamento}%` }}
                ></div>
              </div>
              <span className="text-2xl font-bold text-green-600">{currentData.percentualProcessamento}%</span>
            </div>
          </div>
        </div>

        {/* Tabela de Histórico */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden border border-gray-100">
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-blue-600">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Histórico de Processamentos</h2>
            </div>
          </div>
          
          <div className="overflow-x-auto table-container">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Mês</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Admitidos</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Desligados</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Valor Admitidos</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Valor Demitidos</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Valor Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Valor Empresa</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Valor Colaborador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historico.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.mes}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-600" />
                        {item.admitidos}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-red-600" />
                        {item.desligados}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-semibold">{item.valorAdmitidos}</td>
                    <td className="px-6 py-4 text-sm text-red-600 font-semibold">{item.valorDemitidos}</td>
                    <td className="px-6 py-4 text-sm text-blue-600 font-bold">{item.valorTotal}</td>
                    <td className="px-6 py-4 text-sm text-indigo-600 font-semibold">{item.valorEmpresa}</td>
                    <td className="px-6 py-4 text-sm text-purple-600 font-semibold">{item.valorColaborador}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Área de Upload */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Upload className="w-6 h-6 text-indigo-600" />
            Upload de Arquivos
          </h2>
          
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50 drag-active' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
            <p className="text-lg font-semibold text-gray-700 mb-2">
              Arraste e solte seus arquivos aqui
            </p>
            <p className="text-gray-500 mb-4">ou</p>
            <label className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
              <Upload className="w-5 h-5 mr-2" />
              Selecionar Arquivos
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileInput}
                accept=".xlsx,.xls,.csv"
              />
            </label>
          </div>

          {/* Lista de Arquivos */}
          {files.length > 0 && (
            <div className="mt-6 animate-fadeIn">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Arquivos Selecionados:</h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">{file.name}</span>
                      <span className="text-sm text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 transition-colors text-xl font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Campos de Valores Calculados */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Calculator className="w-6 h-6 text-purple-600" />
            Valores Calculados
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Qtd Colaboradores</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">{valoresCalculados.qtdColaboradores}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Valor Total</h3>
              </div>
              <p className="text-xl font-bold text-green-600">{valoresCalculados.valorTotal}</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-indigo-800">Valor Empresa</h3>
              </div>
              <p className="text-xl font-bold text-indigo-600">{valoresCalculados.valorEmpresa}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-800">Valor Colaborador</h3>
              </div>
              <p className="text-xl font-bold text-purple-600">{valoresCalculados.valorColaborador}</p>
            </div>
          </div>
        </div>

        {/* Link de Download */}
        {downloadLink && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 animate-fadeIn">
            <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Base Consolidada Pronta
            </h3>
            <a
              href={downloadLink}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all hover:scale-105"
              download
            >
              <Download className="w-5 h-5 mr-2" />
              Download da Base Consolidada
            </a>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-4 justify-center mobile-stack">
          <button
            onClick={handleStartProcessing}
            disabled={files.length === 0 || isProcessing}
            className={`flex items-center px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all ${
              files.length === 0 || isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-lg'
            }`}
          >
            {isProcessing ? (
              <>
                <Calculator className="w-6 h-6 mr-3 animate-spin processing-animation" />
                Processando...
              </>
            ) : (
              <>
                <Play className="w-6 h-6 mr-3" />
                Iniciar Processamento
              </>
            )}
          </button>

          <button
            onClick={handleFinishProcessing}
            disabled={!downloadLink || !isProcessing}
            className={`flex items-center px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all ${
              !downloadLink || !isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 hover:scale-105 shadow-lg'
            }`}
          >
            <CheckCircle className="w-6 h-6 mr-3" />
            Concluir Processamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default VRVACalculator;