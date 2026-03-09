import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ReferralTableCard from "../components/ReferralTableCard";
import useReferralDownline from "../hooks/useReferralDownline";

const formatDate = (dateValue) => {
  if (!dateValue) return "--";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "--";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const getDays = (joinDate, activationDate) => {
  if (!joinDate || !activationDate) return "--";

  const start = new Date(joinDate);
  const end = new Date(activationDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "--";
  }

  const diffInMs = end.getTime() - start.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  return diffInDays >= 0 ? diffInDays : "--";
};

export default function ReferralPromoters() {
  const { rows, isLoading, error } = useReferralDownline();

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (row) => `${row.fullname || "--"} ( ${row.user_id || "--"} )`,
    },
    {
      key: "activation_amount",
      header: "Activation Amount",
      render: (row) => row.activation_amount ?? "--",
    },
    {
      key: "days",
      header: "Days",
      render: (row) => getDays(row.created_at, row.activation_date),
    },
    {
      key: "state",
      header: "State",
      render: (row) => row.state || "--",
    },
    {
      key: "city",
      header: "City",
      render: (row) => row.city || "--",
    },
    {
      key: "sponsored_side",
      header: "Sponsored Side",
      render: (row) => row.sponsored_side || "--",
    },
    {
      key: "join_date",
      header: "Join Date",
      render: (row) => formatDate(row.created_at),
    },
    {
      key: "activation_date",
      header: "Activation Date",
      render: (row) => formatDate(row.activation_date),
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />

        <ReferralTableCard
          title="Referral Promoters"
          columns={columns}
          rows={rows}
          isLoading={isLoading}
          error={error}
          emptyMessage="No referral promoters found"
        />
      </div>
    </div>
  );
}
