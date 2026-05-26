import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DimensionRankingEntry, DimensionRankingsResponse } from "@/lib/types/logs";
import { formatCompactNumber as formatNumber } from "@/lib/utils/numbers";
import { memo, useCallback, useMemo, useState } from "react";
import { formatCost, SortableHeader, TrendBadge } from "./rankingsShared";

type SortField = "total_requests" | "total_tokens" | "total_cost";
type SortOrder = "asc" | "desc";

interface DimensionRankingsTabProps {
	data: DimensionRankingsResponse | null;
	loading: boolean;
	dimensionLabel: string;
	testIdPrefix: string;
}

function DimensionRankingsTabImpl({ data, loading, dimensionLabel, testIdPrefix }: DimensionRankingsTabProps) {
	const [sortField, setSortField] = useState<SortField>("total_requests");
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

	const handleSort = useCallback(
		(field: SortField) => {
			if (sortField === field) {
				setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
			} else {
				setSortField(field);
				setSortOrder("desc");
			}
		},
		[sortField],
	);

	const sortedRankings = useMemo(() => {
		if (!data?.rankings) return [];
		return [...data.rankings].sort((a, b) => {
			const aVal = a[sortField];
			const bVal = b[sortField];
			return sortOrder === "desc" ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
		});
	}, [data, sortField, sortOrder]);

	if (loading) {
		return (
			<Card className="rounded-sm p-4 shadow-none">
				<div className="space-y-3">
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-[300px] w-full" />
				</div>
			</Card>
		);
	}

	if (!data?.rankings?.length) {
		return (
			<Card className="rounded-sm p-4 shadow-none">
				<div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
					No {dimensionLabel.toLowerCase()} usage data available for this time period.
				</div>
			</Card>
		);
	}

	return (
		<Card className="rounded-sm p-2 shadow-none" data-testid={`${testIdPrefix}-table`}>
			<span className="text-primary pl-2 text-sm font-medium">{dimensionLabel} Rankings</span>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-12">#</TableHead>
						<TableHead>{dimensionLabel}</TableHead>
						<TableHead className="text-right">
							<SortableHeader
								label="Requests"
								field="total_requests"
								currentSort={sortField}
								currentOrder={sortOrder}
								onSort={handleSort}
							/>
						</TableHead>
						<TableHead className="text-right">
							<SortableHeader
								label="Tokens"
								field="total_tokens"
								currentSort={sortField}
								currentOrder={sortOrder}
								onSort={handleSort}
							/>
						</TableHead>
						<TableHead className="text-right">
							<SortableHeader label="Cost" field="total_cost" currentSort={sortField} currentOrder={sortOrder} onSort={handleSort} />
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sortedRankings.map((entry: DimensionRankingEntry, index: number) => (
						<TableRow key={entry.id}>
							<TableCell className="text-muted-foreground font-mono text-xs">{index + 1}</TableCell>
							<TableCell>
								<div className="flex flex-col">
									<span className="font-medium">{entry.name || entry.id}</span>
									{entry.name && entry.name !== entry.id && (
										<span className="text-muted-foreground text-xs">{entry.id}</span>
									)}
								</div>
							</TableCell>
							<TableCell className="text-right">
								<div className="flex items-center justify-end gap-2">
									<span>{formatNumber(entry.total_requests)}</span>
									<TrendBadge value={entry.trend.requests_trend} isNew={!entry.trend.has_previous_period} />
								</div>
							</TableCell>
							<TableCell className="text-right">
								<div className="flex items-center justify-end gap-2">
									<span>{formatNumber(entry.total_tokens)}</span>
									<TrendBadge value={entry.trend.tokens_trend} isNew={!entry.trend.has_previous_period} />
								</div>
							</TableCell>
							<TableCell className="text-right">
								<div className="flex items-center justify-end gap-2">
									<span>{formatCost(entry.total_cost)}</span>
									<TrendBadge value={entry.trend.cost_trend} positiveIsGood={false} isNew={!entry.trend.has_previous_period} />
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Card>
	);
}

export const DimensionRankingsTab = memo(DimensionRankingsTabImpl);
