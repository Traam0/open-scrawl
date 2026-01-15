import Layout from "@/components/layout";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCleanStore } from "@/stores/clean.store";
import { BrushCleaning, Play } from "lucide-react";
import { useEffect, useState } from "react";

export default function Page() {
  const cleanOptions = useCleanStore();
  const [columns, setColumns] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((r) => {
        setColumns(Object.keys(r.data[0]));
      });
  }, []);
  return (
    <Layout>
      <SiteHeader title="Clean Your Data" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2 px-4 lg:px-6">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  <BrushCleaning className="bg-primary text-primary-foreground rounded-lg box-content p-1.5" />
                  Cleaning Configuration
                </CardTitle>
                <CardDescription>
                  Select options to clean and normalize your data
                </CardDescription>
                <CardAction>
                  <Button
                    size="icon-lg"
                    variant="default"
                    onClick={() => {
                      fetch("/api/generate/script/cleaning", {
                        method: "POST",
                        body: JSON.stringify({ ...cleanOptions }),
                      });
                    }}
                  >
                    <Play />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <FieldGroup className="flex-row">
                    <Field>
                      <FieldLabel>Target Column</FieldLabel>
                      <Select
                        value={cleanOptions.targetColumn}
                        onValueChange={cleanOptions.setTargetColumn}
                      >
                        <SelectTrigger className="w-45">
                          <SelectValue placeholder="Select target" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="all">All Columns</SelectItem>
                            {columns.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Target context for the cleaning strategy
                      </FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel>NHS</FieldLabel>
                      <Select
                        value={cleanOptions.nhs}
                        onValueChange={cleanOptions.setNhs}
                      >
                        <SelectTrigger className="w-45">
                          <SelectValue placeholder="Select a strategy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Suppression</SelectLabel>
                            <SelectItem value="drop_rows">Drop_rows</SelectItem>
                            <SelectItem value="drop_columns">
                              Drop_columns
                            </SelectItem>
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Statistical</SelectLabel>
                            <SelectItem value="mean">Mean</SelectItem>
                            <SelectItem value="median">Median</SelectItem>
                            <SelectItem value="mode">Mode</SelectItem>
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Constant</SelectLabel>
                            <SelectItem value="zero">zero</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Null values hadnling strategy
                      </FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel>Normalzation strategy</FieldLabel>
                      <Select
                        value={cleanOptions.normalization}
                        disabled={!cleanOptions.enableNormalization}
                        onValueChange={cleanOptions.setNormalization}
                      >
                        <SelectTrigger className="w-45">
                          <SelectValue placeholder="Select a strategy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Range based</SelectLabel>
                            <SelectItem value="mix_max_0_1">
                              Min_max [0,1]
                            </SelectItem>
                            <SelectItem value="min_max_-1_1">
                              Min_max [-1,1]
                            </SelectItem>
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Z-Score </SelectLabel>
                            <SelectItem value="z_score_standard">
                              Standard
                            </SelectItem>
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Outlier-resistant</SelectLabel>
                            <SelectItem disabled value="robust">
                              Robust
                            </SelectItem>
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Logarithmic</SelectLabel>
                            <SelectItem disabled value="log">
                              Log
                            </SelectItem>
                            <SelectItem disabled value="log_10">
                              Log10
                            </SelectItem>
                            <SelectItem disabled value="yeo_johnson">
                              Yeo Johnson
                            </SelectItem>
                            <SelectItem disabled value="box_cox">
                              Box Cox
                            </SelectItem>
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Vector Norm</SelectLabel>
                            <SelectItem disabled value="l1">
                              L1 normalization
                            </SelectItem>
                            <SelectItem disabled value="l2">
                              L2 normalization
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Null values hadnling strategy
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                  <FieldGroup className="flex-row ">
                    <Field>
                      <FieldLabel>Custom Value</FieldLabel>
                      <Input
                        onChange={(e) =>
                          cleanOptions.setCustomValue(e.target.value)
                        }
                        placeholder="Enter custom fill value "
                        disabled={cleanOptions.nhs != "custom"}
                      />
                      <FieldDescription>
                        Value to be used for when NHS is set to "custom"
                      </FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel>Other Options</FieldLabel>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={cleanOptions.trimWhiteSpaces}
                          onCheckedChange={cleanOptions.setTrimingOption}
                        />
                        <Label>Trim white spaces</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={cleanOptions.removeDupRows}
                          onCheckedChange={cleanOptions.setDupRemovalOption}
                        />
                        <Label>Remove Duplicate Rows</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={cleanOptions.enableNormalization}
                          onCheckedChange={cleanOptions.setNormalizationOption}
                        />
                        <Label>Enable Normalization</Label>
                      </div>
                    </Field>
                    <Field></Field>
                  </FieldGroup>
                </FieldGroup>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
