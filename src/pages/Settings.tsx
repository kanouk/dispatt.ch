import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState } from "react";
import { useApiKeys, useCreateApiKey, useToggleApiKey, useDeleteApiKey } from "@/hooks/useApiKeys";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Copy, Key, BookOpen } from "lucide-react";

const Settings = () => {
  const { data: apiKeys, isLoading } = useApiKeys();
  const createApiKey = useCreateApiKey();
  const toggleApiKey = useToggleApiKey();
  const deleteApiKey = useDeleteApiKey();
  const { toast } = useToast();

  const [keyName, setKeyName] = useState("Default");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  const handleCreateKey = async () => {
    try {
      const rawKey = await createApiKey.mutateAsync(keyName);
      setNewlyCreatedKey(rawKey);
      setKeyName("Default");
      toast({ title: "APIキーを作成しました" });
    } catch {
      toast({ title: "エラー", description: "APIキーの作成に失敗しました", variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "コピーしました" });
  };

  const baseUrl = `https://ykimfxowxsmktqzvcmom.supabase.co/functions/v1/api`;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">設定</h1>

        {/* API Key Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              APIキー管理
            </CardTitle>
            <CardDescription>
              外部からAPIを利用するための認証キーを管理します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create Key */}
            <Dialog open={isCreateOpen || !!newlyCreatedKey} onOpenChange={(open) => {
              if (!open) {
                setIsCreateOpen(false);
                setNewlyCreatedKey(null);
              } else {
                setIsCreateOpen(true);
              }
            }}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  新しいAPIキーを作成
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {newlyCreatedKey ? "APIキーが作成されました" : "新しいAPIキーを作成"}
                  </DialogTitle>
                </DialogHeader>
                {newlyCreatedKey ? (
                  <div className="space-y-4">
                    <p className="text-sm text-destructive font-medium">
                      ⚠️ このキーは一度しか表示されません。安全な場所に保存してください。
                    </p>
                    <div className="flex items-center gap-2">
                      <Input value={newlyCreatedKey} readOnly className="font-mono text-xs" />
                      <Button size="icon" variant="outline" onClick={() => copyToClipboard(newlyCreatedKey)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>キー名</Label>
                      <Input
                        value={keyName}
                        onChange={(e) => setKeyName(e.target.value)}
                        placeholder="例: CI/CD, 外部ツール"
                      />
                    </div>
                    <Button onClick={handleCreateKey} disabled={createApiKey.isPending}>
                      作成
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Key List */}
            {isLoading ? (
              <p className="text-sm text-muted-foreground">読み込み中...</p>
            ) : apiKeys && apiKeys.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名前</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>最終使用日</TableHead>
                    <TableHead>作成日</TableHead>
                    <TableHead className="w-24">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={key.is_active}
                            onCheckedChange={(checked) =>
                              toggleApiKey.mutate({ id: key.id, is_active: checked })
                            }
                          />
                          <Badge variant={key.is_active ? "default" : "secondary"}>
                            {key.is_active ? "有効" : "無効"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {key.last_used_at
                          ? new Date(key.last_used_at).toLocaleDateString("ja-JP")
                          : "未使用"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(key.created_at).toLocaleDateString("ja-JP")}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>APIキーを削除しますか？</AlertDialogTitle>
                              <AlertDialogDescription>
                                このキーを使用しているアプリケーションはアクセスできなくなります。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteApiKey.mutate(key.id)}>
                                削除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">APIキーがまだありません</p>
            )}
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              APIドキュメント
            </CardTitle>
            <CardDescription>
              外部からデータを操作するためのREST APIエンドポイント一覧
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">ベースURL</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-muted px-3 py-2 rounded-md flex-1 break-all">
                    {baseUrl}
                  </code>
                  <Button size="icon" variant="outline" onClick={() => copyToClipboard(baseUrl)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">認証</Label>
                <code className="block text-xs bg-muted px-3 py-2 rounded-md mt-1">
                  Authorization: Bearer {"<your-api-key>"}
                </code>
              </div>

              <Accordion type="multiple" className="w-full">
                <AccordionItem value="services">
                  <AccordionTrigger className="text-sm font-medium">
                    サービス API
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-xs">
                      <EndpointDoc method="GET" path="/services" desc="サービス一覧を取得" />
                      <EndpointDoc method="GET" path="/services/:id" desc="サービス詳細を取得" />
                      <EndpointDoc
                        method="POST"
                        path="/services"
                        desc="サービスを作成"
                        body={`{ "name": "My Service", "slug": "my-service", "default_platform": "YOUTUBE" }`}
                      />
                      <EndpointDoc method="PUT" path="/services/:id" desc="サービスを更新" body={`{ "name": "Updated Name" }`} />
                      <EndpointDoc method="DELETE" path="/services/:id" desc="サービスを削除" />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="episodes">
                  <AccordionTrigger className="text-sm font-medium">
                    エピソード API
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-xs">
                      <EndpointDoc method="GET" path="/episodes?service_id=xxx" desc="エピソード一覧を取得（service_id, statusでフィルタ可）" />
                      <EndpointDoc method="GET" path="/episodes/:id" desc="エピソード詳細を取得" />
                      <EndpointDoc
                        method="POST"
                        path="/episodes"
                        desc="エピソードを作成"
                        body={`{ "service_id": "uuid", "ep_no": 1, "title": "Episode 1", "status": "LIVE" }`}
                      />
                      <EndpointDoc method="PUT" path="/episodes/:id" desc="エピソードを更新" body={`{ "title": "Updated", "youtube_url": "https://..." }`} />
                      <EndpointDoc method="DELETE" path="/episodes/:id" desc="エピソードを削除" />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="example">
                  <AccordionTrigger className="text-sm font-medium">
                    使用例 (curl)
                  </AccordionTrigger>
                  <AccordionContent>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
{`# サービス一覧を取得
curl -H "Authorization: Bearer dpk_xxxxx" \\
  ${baseUrl}/services

# エピソードを作成
curl -X POST \\
  -H "Authorization: Bearer dpk_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"service_id":"uuid","ep_no":1,"title":"Ep 1","status":"LIVE"}' \\
  ${baseUrl}/episodes`}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

const EndpointDoc = ({ method, path, desc, body }: { method: string; path: string; desc: string; body?: string }) => {
  const methodColors: Record<string, string> = {
    GET: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    POST: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    PUT: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div className="border border-border rounded-md p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${methodColors[method] || ""}`}>
          {method}
        </span>
        <code className="text-muted-foreground">{path}</code>
      </div>
      <p className="text-muted-foreground">{desc}</p>
      {body && (
        <pre className="mt-2 bg-muted p-2 rounded text-[10px] overflow-x-auto">{body}</pre>
      )}
    </div>
  );
};

export default Settings;
