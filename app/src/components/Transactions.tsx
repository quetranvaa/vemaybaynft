import { TransactionType, TxHistory } from "../types";
import { Transaction } from "./Transaction";

interface TransactionsProps {
  items: TxHistory[] | null;
  type: TransactionType;
}

export const Transactions = ({ items, type }: TransactionsProps) => {
  const hasNoItems = !items || items?.length === 0;
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Người mua
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Người bán
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    NFT
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Đề nghị(SOL)
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Trạng thái
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Thời gian
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items?.map((item) => (
                  <Transaction key={item?.id} txHistory={item!} type={type} />
                ))}
              </tbody>
            </table>
            {hasNoItems && (
              <div className="p-6 text-xl text-center font-medium text-gray-500">
                Không có giao dịch nào.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
