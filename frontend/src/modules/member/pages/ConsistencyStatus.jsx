import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { IndianRupee } from "lucide-react";
import { useEffect, useState } from "react";
import { requestMemberApi } from "../utils/apiClient";

export default function ConsistencyStatus() {

const [data,setData] = useState({
current_balance:0,
total_credit:0,
total_debit:0,
transactions:[]
});

const [loading,setLoading] = useState(true);
const [error,setError] = useState("");


const member = JSON.parse(localStorage.getItem("memberData") || "{}");
const userId = member?.user_id || "";


useEffect(()=>{

async function fetchData(){

if(!userId){
setError("Please sign in first");
setLoading(false);
return;
}

try{

const res = await requestMemberApi("/member/consistency-status?limit=200",{
method:"GET",
headers:{
Accept:"application/json",
"X-Auth-Member":userId
}
});

if(!res.ok){
throw new Error(res.data?.message || "Unable to fetch data");
}

const apiData = res.data?.data || {};

setData({
current_balance: Number(apiData.current_balance || 0),
total_credit: Number(apiData.total_credit || 0),
total_debit: Number(apiData.total_debit || 0),
transactions: apiData.transactions || []
});

}catch(err){
setError(err.message);
}

setLoading(false);

}

fetchData();

},[userId]);


// format currency
const formatCurrency = (amount)=>{
return new Intl.NumberFormat("en-IN",{
style:"currency",
currency:"INR"
}).format(amount || 0);
};


// format date
const formatDate = (date)=>{
if(!date) return "-";

const d = new Date(date);

const day = String(d.getDate()).padStart(2,"0");
const month = String(d.getMonth()+1).padStart(2,"0");
const year = d.getFullYear();

return `${day}-${month}-${year}`;
};


return (
<div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">

<Sidebar/>

<div className="flex-1 flex flex-col">

<Navbar/>

<div className="text-center mt-6">
<h1 className="text-3xl font-bold text-[#B0422E]">
Consistency Status
</h1>
</div>

{loading && <p className="text-center mt-4">Loading status...</p>}
{error && <p className="text-center text-red-500 mt-4">{error}</p>}

<div className="p-6 space-y-6">

{/* Balance Card */}

<div className="bg-[#B0422E] rounded-2xl p-6 text-white">

<div className="flex items-center gap-4">

<div className="bg-white/20 p-4 rounded-xl">
<IndianRupee size={28}/>
</div>

<div>
<p className="text-sm font-semibold">Consistency Balance</p>
<h2 className="text-3xl font-bold">
{formatCurrency(data.current_balance)}
</h2>
</div>

</div>


<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

<div className="bg-[#CF9D94A1] rounded-xl p-6">
<p>Total Credit</p>
<h3 className="text-2xl font-bold mt-2">
{formatCurrency(data.total_credit)}
</h3>
</div>

<div className="bg-[#CF9D94A1] rounded-xl p-6">
<p>Total Debit</p>
<h3 className="text-2xl font-bold mt-2">
{formatCurrency(data.total_debit)}
</h3>
</div>

</div>

</div>


{/* Table */}

<div className="bg-white rounded-2xl shadow-sm p-6 overflow-x-auto">

<table className="w-full text-sm">

<thead>
<tr className="bg-[#B0422E] text-white">

<th className="py-3 px-4 text-left">Sr No</th>
<th className="py-3 px-4 text-left">Date</th>
<th className="py-3 px-4 text-left">Detail</th>
<th className="py-3 px-4 text-left">Credit Amount</th>
<th className="py-3 px-4 text-left">Debit Amount</th>
<th className="py-3 px-4 text-left">Balance</th>

</tr>
</thead>

<tbody>

{data.transactions.length === 0 && !loading && (
<tr>
<td colSpan="6" className="py-4 px-4">
No consistency transactions found
</td>
</tr>
)}

{data.transactions.map((row,index)=>(
<tr key={index} className="border-b">

<td className="py-4 px-4">{index+1}</td>

<td className="py-4 px-4">
{formatDate(row.date)}
</td>

<td className="py-4 px-4">
{row.description || "-"}
</td>

<td className="py-4 px-4">
{row.credit_amount ? formatCurrency(row.credit_amount) : "--"}
</td>

<td className="py-4 px-4">
{row.debit_amount ? formatCurrency(row.debit_amount) : "--"}
</td>

<td className="py-4 px-4">
{row.balance_after ? formatCurrency(row.balance_after) : "--"}
</td>

</tr>
))}

</tbody>

</table>

</div>

</div>

</div>

</div>
);
}