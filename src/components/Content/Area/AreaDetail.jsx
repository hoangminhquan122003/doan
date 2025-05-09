import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getTablesByAreaId } from "../../../services/TableService";
import Table from "./Table";

function AreaDetail() {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const { areaId } = useParams(); // dùng trực tiếp

    useEffect(() => {
        const fetchTables = async () => {
            try {
                setLoading(true);
                const response = await getTablesByAreaId(areaId);
                setTables(response.data.result);
            } catch (error) {
                console.log('Error fetching tables: ', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTables();
        document.title = "Quản lý bàn ăn";
    }, [areaId]); // theo dõi areaId trực tiếp

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((table) => (
                <Table
                    key={table.tableId}
                    tableId={table.tableId}
                    name={table.tableName}
                    status={table.status}
                />
            ))}
        </div>
    );
}

export default AreaDetail;
