export const MAX_ATTACHMENT=3*1024*1024;
function mp3Header(bytes){let start=0;if(bytes.subarray(0,3).toString()==='ID3'&&bytes.length>=10){if([...bytes.subarray(6,10)].some(v=>v>127))return false;start=10+(bytes[6]<<21)+(bytes[7]<<14)+(bytes[8]<<7)+bytes[9]}if(start+4>bytes.length)return false;return bytes[start]===255&&(bytes[start+1]&0xe0)===0xe0&&(bytes[start+1]&0x18)!==0x08&&(bytes[start+1]&6)!==0&&(bytes[start+2]&0xf0)!==0xf0&&(bytes[start+2]&0x0c)!==0x0c}
export function validateAttachment(bytes,name){
 if(!bytes.length||bytes.length>MAX_ATTACHMENT)throw Error('Envie um arquivo de até 3 MB.');
 let mime;if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)mime='image/jpeg';
 else if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))mime='image/png';
 else if(bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP')mime='image/webp';
 else if(bytes.subarray(0,5).toString()==='%PDF-')mime='application/pdf';
 else if(bytes.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3]))&&bytes.subarray(0,4096).includes(Buffer.from('webm'))&&(bytes.includes(Buffer.from('A_OPUS'))||bytes.includes(Buffer.from('A_VORBIS'))))mime='audio/webm';
 else if(bytes.subarray(0,4).toString()==='OggS'&&(bytes.subarray(0,4096).includes(Buffer.from('OpusHead'))||bytes.subarray(0,4096).includes(Buffer.from('vorbis'))))mime='audio/ogg';
 else if(bytes.length>=16&&bytes.subarray(4,8).toString()==='ftyp'&&bytes.includes(Buffer.from('soun')))mime='audio/mp4';
 else if(mp3Header(bytes))mime='audio/mpeg';
 else throw Error('Use imagem JPG, PNG, WebP, PDF ou áudio WebM, Ogg, M4A ou MP3.');
 const ext={'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','application/pdf':'.pdf','audio/webm':'.webm','audio/ogg':'.ogg','audio/mp4':'.m4a','audio/mpeg':'.mp3'}[mime];
 let safe=String(name||'anexo').normalize('NFC').replace(/[\x00-\x1f\x7f/\\<>:"|?*]/g,'_').replace(/\.+/g,'.').slice(0,145).trim();
 safe=(safe.replace(/\.[^.]*$/,'')||'anexo')+ext;
 return {mime,name:safe,size:bytes.length};
}
