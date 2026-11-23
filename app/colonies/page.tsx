import ModulePage from '@/components/ModulePage';
export default function Colonies(){return <ModulePage title="Koloni" description="Tambah koloni dan catat populasi ayam." collection="colonies" fields={[{name:'name',label:'Nama koloni',required:true},{name:'males',label:'Jumlah ayam jantan',type:'number',required:true},{name:'females',label:'Jumlah ayam betina',type:'number',required:true}]}/>}
