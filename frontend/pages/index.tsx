import Layout from "@/components/layout";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSetup } from "@/stores/setup";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code, Eye, FileCog, Link, Play, Plus, Tag, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function Page() {
  const {
    selectors,
    addSelector,
    updateSelector,
    removeSelector,
    targetUrl,
    setTargetUrl,
    paginationUrlTemplate,
    setPaginationUrlTemplate,
    pages,
    setPages,
    container,
    setContainerSelector,
  } = useSetup();

  const [script, setScript] = useState<string>("");

  return (
    <Layout>
      <SiteHeader title="Setup" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2 px-4 lg:px-6">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Link className="bg-accent rounded-xl p-2 box-content" />
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    Target URL
                    <CardDescription>
                      Enter the webpage URL to scrape data from
                    </CardDescription>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <FieldGroup className="flex-row ">
                    <Field>
                      <FieldLabel>Website URL</FieldLabel>
                      <Input
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value.trim())}
                        placeholder="http://example.com/products"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Website page URL template</FieldLabel>
                      <Input
                        value={paginationUrlTemplate}
                        onChange={(e) =>
                          setPaginationUrlTemplate(e.target.value.trim())
                        }
                        placeholder="http://example.com/products/{}"
                      />
                      <FieldDescription>
                        URL pattern used for paginated pages. Use {"{page}"} as
                        a placeholder for the page number (e.g., /page/
                        {"{page}"}).
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                  <FieldGroup className="flex-row items-end">
                    <Field>
                      <FieldLabel>Target Pages Count </FieldLabel>
                      <Input
                        disabled={!!!paginationUrlTemplate}
                        type="number"
                        min={1}
                        value={pages}
                        onChange={(e) =>
                          setPages(Number(e.target.value.trim()))
                        }
                        placeholder="4"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Data Container Selector</FieldLabel>
                      <Input
                        value={container}
                        onChange={(e) =>
                          setContainerSelector(e.target.value.trim())
                        }
                        placeholder=".product-item"
                      />
                    </Field>
                  </FieldGroup>
                </FieldGroup>
              </CardContent>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                Supported Targets: HTML pages
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Tag className="bg-accent rounded-xl p-2 box-content" />
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    Scraping Definitions
                    <CardDescription>
                      Define the data columns and their HTML selectors
                    </CardDescription>
                  </CardTitle>
                </div>
                <CardAction>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      addSelector({
                        id: selectors[selectors.length - 1].id + 1,
                        columnName: "",
                        selector: "",
                        selectorType: "content",
                        dataType: "text",
                      })
                    }
                  >
                    <Plus />
                    Add Field
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectors.map((f) => (
                  <FieldGroup key={f.id} className="flex-row items-end">
                    <Field>
                      <FieldLabel>Data Column Name</FieldLabel>
                      <Input
                        placeholder="Product Name"
                        value={f.columnName}
                        onChange={(e) =>
                          updateSelector({
                            ...f,
                            columnName: e.target.value
                              .trimStart()
                              .replace(" ", "_"),
                          })
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Selector</FieldLabel>
                      <Input
                        placeholder=".product-title h1"
                        value={f.selector}
                        onChange={(e) =>
                          updateSelector({
                            ...f,
                            selector: e.target.value.trim(),
                          })
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Selection Mode</FieldLabel>
                      <Select
                        defaultValue="content"
                        value={f.selectorType}
                        onValueChange={(v) =>
                          updateSelector({ ...f, selectorType: v as any })
                        }
                      >
                        <SelectTrigger className="w-45">
                          <SelectValue placeholder="Select a mdoe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="content">content</SelectItem>
                            <SelectItem value="attribute">attribute</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Attribute</FieldLabel>
                      <Input
                        disabled={f.selectorType === "content"}
                        placeholder=".product-title h1"
                        value={f.attributeName}
                        onChange={(e) =>
                          updateSelector({
                            ...f,
                            attributeName: e.target.value.trim(),
                          })
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Data Type</FieldLabel>
                      <Select
                        defaultValue="text"
                        value={f.dataType}
                        onValueChange={(v) =>
                          updateSelector({ ...f, dataType: v as any })
                        }
                      >
                        <SelectTrigger className="w-45">
                          <SelectValue placeholder="Select data type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="text">text</SelectItem>
                            <SelectItem value="number">number</SelectItem>
                            <SelectItem value="boolean">boolean</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Button
                      onClick={() => removeSelector(f)}
                      size="default"
                      variant="destructive"
                      className="shrink"
                    >
                      <Trash />
                    </Button>
                  </FieldGroup>
                ))}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Dialog>
                <DialogTrigger asChild>
                  <Button disabled={script.trim() === ""} variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Script
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-4xl w-full aspect-square flex flex-col">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <Code className="box-content bg-secondary rounded-lg p-1.5" />
                      Generated Python Script
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-1">
                      This script is automatically generated based on your
                      target URL and selectors. You can copy it to run locally
                      or modify it as needed for your scraping task.
                    </DialogDescription>
                  </DialogHeader>

                  <ScrollArea className="h-full w-full rounded-md border p-4 bg-black text-white">
                    <pre className="text-sm whitespace-pre-wrap">{script}</pre>
                  </ScrollArea>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">close</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                onClick={() => {
                  fetch("/api/generate", {
                    method: "POST",
                    body: JSON.stringify({
                      targetUrl,
                      container,
                      selectors,
                      pages,
                      paginationUrlTemplate,
                    }),
                  })
                    .then((r) => r.json())
                    .then((r) => {
                      setScript(r.script);
                      toast.success("Script generated.", {});
                    })
                    .catch(console.error);
                }}
              >
                <FileCog />
                Generate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
