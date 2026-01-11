import Layout from "@/components/layout";
import { SiteHeader } from "@/components/site-header";
import { GetServerSideProps } from "next";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Frown } from "lucide-react";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
export default function Page({ data, pagination, statistics }: Data) {
  return (
    <Layout>
      <SiteHeader title="Raw Data" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2 px-4 lg:px-6">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
              <Card className="@container/card">
                <CardHeader>
                  <CardDescription>Total Rows</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {statistics.totalRows}
                  </CardTitle>
                  <CardAction>
                    <Badge variant="outline">+12.5%</Badge>
                  </CardAction>
                </CardHeader>
              </Card>
              <Card className="@container/card">
                <CardHeader>
                  <CardDescription>Columns count</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {statistics.totalColumns}
                  </CardTitle>
                  <CardAction>
                    <Badge variant="outline">-20%</Badge>
                  </CardAction>
                </CardHeader>
              </Card>
              <Card className="@container/card">
                <CardHeader>
                  <CardDescription>Missing Values</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {statistics.totalMissingValues}
                  </CardTitle>
                  <CardAction>
                    <Badge variant="outline">+12.5%</Badge>
                  </CardAction>
                </CardHeader>
              </Card>
              <Card className="@container/card">
                <CardHeader>
                  <CardDescription>Completeness</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {statistics.completenessRate}%
                  </CardTitle>
                  <CardAction>
                    <Badge variant="outline">
                      <IconTrendingUp />
                      +4.5%
                    </Badge>
                  </CardAction>
                </CardHeader>
              </Card>
            </div>
            {data.length != 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(data[0]).map((key) => (
                        <TableHead className="font-semibold" key={key}>
                          {key}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row: any) => (
                      <TableRow key={row}>
                        {Object.values(row).map((value, colIndex) => (
                          <TableCell key={colIndex}>{String(value)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3}>Total</TableCell>
                      <TableCell className="text-right">
                        {data.length}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        2
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Frown />
                  </EmptyMedia>
                  <EmptyTitle>No Projects Yet</EmptyTitle>
                  <EmptyDescription>
                    You haven&apos;t created any projects yet. Get started by
                    creating your first project.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <div className="flex gap-2">
                    <Button>
                      <Link href={"/api/run-script"}>Start Scraping</Link>
                    </Button>
                  </div>
                </EmptyContent>
              </Empty>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const { data } = await axios.get<Data>(
      `/api/data?page=${ctx.query.page ?? 1}`
    );
    return {
      props: data,
    };
  } catch {
    return {
      props: {
        rows: [],
      },
    };
  }
};

type ColumnStats = {
  columnName: string;
  missingCount: number;
  missingPercentage: number;
};

type Data = {
  data: any[];
  pagination: {
    page: number;
    pageSize: number;
    totalRows: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  statistics: {
    totalRows: number;
    totalColumns: number;
    totalMissingValues: number;
    completenessRate: number;
    columnStats: ColumnStats[];
  };
};
