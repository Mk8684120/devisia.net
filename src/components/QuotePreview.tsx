import React from 'react';
import { X, Download } from 'lucide-react';
import { Quote } from '../types';
import { useData } from '../context/DataContext';
import jsPDF from 'jspdf';

interface QuotePreviewProps {
  quote: Quote;
  onClose: () => void;
}

const QuotePreview: React.FC<QuotePreviewProps> = ({ quote, onClose }) => {
  const { companyInfo } = useData();

  const downloadPDF = () => {
    const pdf = new jsPDF();
    
    // En-tête
    pdf.setFontSize(20);
    pdf.text('DEVIS', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`N° ${quote.number}`, 20, 45);
    pdf.text(`Date: ${new Date(quote.createdDate).toLocaleDateString('fr-FR')}`, 20, 55);
    pdf.text(`Valide jusqu'au: ${new Date(quote.validUntil).toLocaleDateString('fr-FR')}`, 20, 65);
    
    // Informations entreprise
    pdf.setFontSize(14);
    pdf.text('ENTREPRISE', 20, 85);
    pdf.setFontSize(10);
    pdf.text(companyInfo.name, 20, 95);
    pdf.text(companyInfo.address, 20, 105);
    pdf.text(companyInfo.city, 20, 115);
    pdf.text(`Tel: ${companyInfo.phone}`, 20, 125);
    pdf.text(`Email: ${companyInfo.email}`, 20, 135);
    pdf.text(`SIRET: ${companyInfo.siret}`, 20, 145);
    
    // Informations client
    pdf.setFontSize(14);
    pdf.text('CLIENT', 110, 85);
    pdf.setFontSize(10);
    pdf.text(`${quote.clientName}`, 110, 95);
    pdf.text(`${quote.clientAddress}`, 110, 105);
    pdf.text(`Tel: ${quote.clientPhone}`, 110, 115);
    pdf.text(`Email: ${quote.clientEmail}`, 110, 125);
    
    // Tableau des prestations
    let yPosition = 165;
    pdf.setFontSize(12);
    pdf.text('PRESTATIONS', 20, yPosition);
    
    yPosition += 15;
    pdf.setFontSize(9);
    pdf.text('Description', 20, yPosition);
    pdf.text('Qté', 110, yPosition);
    pdf.text('Prix unit.', 130, yPosition);
    pdf.text('Total', 160, yPosition);
    
    yPosition += 5;
    pdf.line(20, yPosition, 190, yPosition);
    
    quote.items.forEach((item) => {
      yPosition += 10;
      pdf.text(item.description, 20, yPosition);
      pdf.text(`${item.quantity} ${item.unit}`, 110, yPosition);
      pdf.text(`${item.unitPrice.toFixed(2)} €`, 130, yPosition);
      pdf.text(`${item.totalPrice.toFixed(2)} €`, 160, yPosition);
    });
    
    yPosition += 10;
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.text(`TOTAL HT: ${quote.totalAmount.toFixed(2)} €`, 130, yPosition);
    yPosition += 8;
    const vatRate = quote.vatRate || 20;
    pdf.text(`TVA ${vatRate}%: ${(quote.totalAmount * vatRate / 100).toFixed(2)} €`, 130, yPosition);
    yPosition += 8;
    pdf.setFontSize(14);
    pdf.text(`TOTAL TTC: ${(quote.totalAmount * (1 + vatRate / 100)).toFixed(2)} €`, 130, yPosition);
    
    // Conditions
    yPosition += 20;
    pdf.setFontSize(8);
    pdf.text('Conditions: Devis valable 30 jours. Acompte de 30% à la commande.', 20, yPosition);
    
    pdf.save(`devis-${quote.number}.pdf`);
  };

  const vatRate = quote.vatRate || 20;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Aperçu du devis #{quote.number}</h2>
          <div className="flex space-x-2">
            <button
              onClick={downloadPDF}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Télécharger PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-8">
          {/* En-tête du devis */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">DEVIS</h1>
            <div className="text-gray-600">
              <p>N° {quote.number}</p>
              <p>Date: {new Date(quote.createdDate).toLocaleDateString('fr-FR')}</p>
              <p>Valide jusqu'au: {new Date(quote.validUntil).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          {/* Informations entreprise et client */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">ENTREPRISE</h3>
              <div className="text-gray-700">
                <p className="font-medium">{companyInfo.name}</p>
                <p>{companyInfo.address}</p>
                <p>{companyInfo.city}</p>
                <p>Tel: {companyInfo.phone}</p>
                <p>Email: {companyInfo.email}</p>
                <p>SIRET: {companyInfo.siret}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">CLIENT</h3>
              <div className="text-gray-700">
                <p className="font-medium">{quote.clientName}</p>
                <p>{quote.clientAddress}</p>
                <p>Tel: {quote.clientPhone}</p>
                <p>Email: {quote.clientEmail}</p>
              </div>
            </div>
          </div>

          {/* Tableau des prestations */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">PRESTATIONS</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 border-b border-gray-300 font-medium text-gray-700">Description</th>
                    <th className="text-center py-3 px-4 border-b border-gray-300 font-medium text-gray-700">Quantité</th>
                    <th className="text-right py-3 px-4 border-b border-gray-300 font-medium text-gray-700">Prix unitaire</th>
                    <th className="text-right py-3 px-4 border-b border-gray-300 font-medium text-gray-700">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-3 px-4 border-b border-gray-200">{item.description}</td>
                      <td className="py-3 px-4 border-b border-gray-200 text-center">{item.quantity} {item.unit}</td>
                      <td className="py-3 px-4 border-b border-gray-200 text-right">{item.unitPrice.toFixed(2)} €</td>
                      <td className="py-3 px-4 border-b border-gray-200 text-right font-medium">{item.totalPrice.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totaux */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium">Sous-total HT:</span>
                <span>{quote.totalAmount.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium">TVA ({vatRate}%):</span>
                <span>{(quote.totalAmount * vatRate / 100).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-800">
                <span className="text-lg font-bold">TOTAL TTC:</span>
                <span className="text-lg font-bold">{(quote.totalAmount * (1 + vatRate / 100)).toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Transcription */}
          {quote.transcription && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">TRANSCRIPTION VOCALE</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 italic">{quote.transcription}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {quote.notes && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">NOTES</h3>
              <p className="text-gray-700">{quote.notes}</p>
            </div>
          )}

          {/* Conditions */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">CONDITIONS GÉNÉRALES</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Ce devis est valable 30 jours à compter de sa date d'émission.</p>
              <p>• Un acompte de 30% sera demandé à la commande.</p>
              <p>• Les travaux débuteront après validation du devis et encaissement de l'acompte.</p>
              <p>• Garantie décennale et responsabilité civile professionnelle.</p>
              <p>• TVA à {vatRate}% {vatRate === 10 ? '(travaux de rénovation)' : '(travaux neufs)'}.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotePreview;