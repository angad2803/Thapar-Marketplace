import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, Tbody, Td, Th, Thead, Tr } from "../../components/ui/table";
import { Input } from "@/components/ui/input";
import { Pagination } from "../../components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { API_URL } from "@/config/api";

interface AdminLog {
  _id: string;
  adminId: { name: string; email: string };
  action: string;
  targetType: string;
  targetId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ admin: "", action: "", targetType: "" });

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [page, filters]);

  async function fetchLogs() {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "20",
      ...(filters.admin ? { adminId: filters.admin } : {}),
      ...(filters.action ? { action: filters.action } : {}),
      ...(filters.targetType ? { targetType: filters.targetType } : {}),
    });
    const res = await fetch(`${API_URL}/admin-logs?${params.toString()}`, {
      credentials: "include",
    });
    const data = await res.json();
    setLogs(data.data || []);
    setPages(data.pages || 1);
    setTotal(data.total || 0);
    setLoading(false);
  }

  return (
    <Card className="p-6 max-w-6xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Admin Logs</h2>
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Filter by Admin ID"
          value={filters.admin}
          onChange={e => setFilters(f => ({ ...f, admin: e.target.value }))}
        />
        <Input
          placeholder="Filter by Action"
          value={filters.action}
          onChange={e => setFilters(f => ({ ...f, action: e.target.value }))}
        />
        <Input
          placeholder="Filter by Target Type"
          value={filters.targetType}
          onChange={e => setFilters(f => ({ ...f, targetType: e.target.value }))}
        />
      </div>
      <Table>
        <Thead>
          <Tr>
            <Th>Admin</Th>
            <Th>Action</Th>
            <Th>Target Type</Th>
            <Th>Target ID</Th>
            <Th>Details</Th>
            <Th>IP Address</Th>
            <Th>Date</Th>
          </Tr>
        </Thead>
        <Tbody>
          {loading ? (
            <Tr>
              <Td colSpan={7} className="text-center">Loading...</Td>
            </Tr>
          ) : logs.length === 0 ? (
            <Tr>
              <Td colSpan={7} className="text-center">No logs found.</Td>
            </Tr>
          ) : (
            logs.map(log => (
              <Tr key={log._id}>
                <Td>
                  <div className="flex flex-col">
                    <span className="font-semibold">{log.adminId?.name}</span>
                    <span className="text-xs text-muted-foreground">{log.adminId?.email}</span>
                  </div>
                </Td>
                <Td><Badge>{log.action}</Badge></Td>
                <Td>{log.targetType}</Td>
                <Td>{log.targetId || "-"}</Td>
                <Td className="max-w-xs truncate" title={log.details}>{log.details || "-"}</Td>
                <Td>{log.ipAddress || "-"}</Td>
                <Td>{new Date(log.createdAt).toLocaleString()}</Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
      <Pagination
        page={page}
        pages={pages}
        total={total}
        onPageChange={setPage}
      />
    </Card>
  );
}
