import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import {
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Description as FileTextIcon,
  Book,
  Info as InfoIcon
} from '@mui/icons-material';

interface Document {
  id: string;
  fileName: string;
  uploadDate: string;
  fileSize?: number; // 文件大小，单位为字节
}

interface FileType {
  key: string;
  text: string;
}

function App() {
  // 状态定义
  const [activeTab, setActiveTab] = useState<number>(0);
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedFileType, setSelectedFileType] = useState<string>('');
  const [selectedFileSize, setSelectedFileSize] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const fileUploadRef = useRef<HTMLInputElement>(null);

  // 显示Snackbar提示
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // 关闭Snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // 处理文件选择变化
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      
      if (files.length === 1) {
        const file = files[0];
        // 根据文件类型设置下拉框的值
        setSelectedFileType(file.type);
        
        // 计算并设置文件大小（转换为MB并保留两位小数）
        const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        setSelectedFileSize(fileSizeInMB);
        
        // 设置文件名
        setSelectedFileName(file.name);
      } else {
        // 多个文件时清空单个文件的信息
        setSelectedFileType('');
        setSelectedFileSize('');
        setSelectedFileName('');
      }
    } else {
      // 没有选择文件时清空
      setSelectedFileSize('');
      setSelectedFileName('');
      setSelectedFiles([]);
    }
  };

  // 文件类型数据
  const fileTypes: FileType[] = [
    { key: "text/plain", text: "文本文件 (.txt)" },
    { key: "application/pdf", text: "PDF文件 (.pdf)" },
    { key: "application/msword", text: "Word文档 (.doc)" },
    { key: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", text: "Word文档 (.docx)" }
  ];

  // 加载文档列表
  const loadDocuments = () => {
    fetch("http://localhost:8081/documents/list")
      .then(response => {
        // 即使response.ok为false，也继续处理，不抛出错误
        // 400状态码被视为正常情况
        return response.json().catch(() => null); // 处理无法解析JSON的情况
      })
      .then(data => {
        // 处理null或任何返回的数据
        setDocuments(data || []); // 如果是null，则设置为空数组
      })
      .catch(() => {
        // 静默处理所有错误，不在控制台产生error
        setDocuments([]); // 出错时也设置为空数组
      });
  };

  // 上传单个文件的辅助函数
  const uploadSingleFile = async (file: File, index: number, total: number) => {
    // 检查文件大小 (100MB)
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error(`${file.name} 文件过大，最大支持100MB`);
    }

    // 创建表单数据
    const formData = new FormData();
    formData.append("file", file);

    // 更新进度为当前文件的上传准备
    const baseProgress = (index / total) * 100;
    setUploadProgress(baseProgress);

    // 发送上传请求
    const response = await fetch("http://localhost:8081/documents/upload", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    // 更新进度为当前文件上传完成
    const fileProgress = ((index + 1) / total) * 100;
    setUploadProgress(fileProgress);

    return file.name;
  };

  // 上传文件
  const handleUploadFile = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      showSnackbar("请先选择文件", "warning");
      return;
    }

    // 显示加载状态
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFiles: string[] = [];
      const failedFiles: {name: string, error: string}[] = [];
      
      // 循环上传每个文件
      for (let i = 0; i < selectedFiles.length; i++) {
        try {
          const fileName = await uploadSingleFile(selectedFiles[i], i, selectedFiles.length);
          uploadedFiles.push(fileName);
        } catch (error) {
          failedFiles.push({
            name: selectedFiles[i].name,
            error: error instanceof Error ? error.message : "上传失败"
          });
        }
      }

      // 所有文件处理完成后
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 300);

      // 显示上传结果
      if (uploadedFiles.length > 0) {
        showSnackbar(`${uploadedFiles.length} 个文件上传成功`, "success");
      }
      
      if (failedFiles.length > 0) {
        failedFiles.forEach(failedFile => {
          showSnackbar(`文件 ${failedFile.name}: ${failedFile.error}`, "error");
        });
      }

      // 重置文件输入
      if (fileUploadRef.current) {
        fileUploadRef.current.value = '';
      }
      setSelectedFileType('');
      setSelectedFileSize('');
      setSelectedFileName('');
      setSelectedFiles([]);
      loadDocuments(); // 刷新文档列表
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      let errorMessage = error instanceof Error ? error.message : "上传过程中发生错误";

      // 提取具体的错误原因
      const match = errorMessage.match(/文档上传失败: (.+)/);
      if (match && match[1]) {
        errorMessage = match[1];
      }

      showSnackbar(`上传失败: ${errorMessage}`, "error");
    }
  };

  // 提交问题
  const handleSubmitQuestion = async () => {
    if (!question.trim()) {
      showSnackbar("请输入问题", "warning");
      return;
    }

    // 清空之前的答案
    setAnswer('');
    
    try {
      // 直接连接后端地址
      const response = await fetch("http://localhost:8081/qa/ask/stream", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain"
        },
        body: question
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      // 检查响应是否支持流式读取
      if (!response.body) {
        throw new Error("响应体不可用");
      }

      // 创建一个读取器来处理流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullTextContent = ''; // 用于存储所有提取的textContent内容

      // 循环读取数据块
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        // 解码接收到的二进制数据
        const chunk = decoder.decode(value, { stream: true });
        
        // 从当前块中提取textContent内容
        const textContentMatch = chunk.match(/textContent=([^,]+)/);
        if (textContentMatch && textContentMatch[1]) {
          const newTextContent = textContentMatch[1].trim();
          // 累加新的textContent内容
          fullTextContent = fullTextContent + newTextContent;
          // 设置到状态中，实现流式显示
          setAnswer(fullTextContent);
        }
      }

    } catch (error) {
      showSnackbar(`获取答案失败: ${error instanceof Error ? error.message : String(error)}`, "error");
    }
  };

  // 打开删除确认对话框
  const handleDeleteDocument = (fileName: string) => {
    setCurrentFileName(fileName);
    setDeleteDialogOpen(true);
  };

  // 确认删除文档
  const confirmDelete = () => {
    // 发送删除请求
    fetch(`http://localhost:8081/documents/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: currentFileName })
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(text);
          });
        }
        return response.text();
      })
      .then(() => {
        showSnackbar(`文档 "${currentFileName}" 删除成功`, "success");
        setDeleteDialogOpen(false);
        loadDocuments(); // 刷新文档列表
      })
      .catch(error => {
        showSnackbar(`删除失败: ${error.message}`, "error");
        setDeleteDialogOpen(false);
      });
  };

  // 取消删除
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  // 组件挂载时加载文档列表
  useEffect(() => {
    loadDocuments();
  }, []);

  // 处理标签页切换
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <div className="app-container">
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {/* 顶部标题栏 */}
        <Box 
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            py: 3,
            px: 4,
            boxShadow: 3,
            mb: 4
          }}
        >
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            知识库管理系统
          </Typography>
          <Typography variant="body1" align="center" color="primary.light">
            高效管理文档与智能问答系统
          </Typography>
        </Box>

        {/* 标签页导航 */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', maxWidth: '1200px', mx: 'auto', width: '100%' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="fullWidth" 
            sx={{
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontWeight: 500,
                py: 2,
              },
              '& .Mui-selected': {
                color: 'primary.main',
                fontWeight: 600,
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
                height: 3,
              },
            }}
          >
            <Tab 
              icon={<FileTextIcon />} 
              iconPosition="start" 
              label="文档管理" 
              sx={{ textTransform: 'none' }}
            />
            <Tab 
              icon={<Book />} 
              iconPosition="start" 
              label="知识库问答" 
              sx={{ textTransform: 'none' }}
            />
          </Tabs>
        </Box>

        {/* 主内容区域 */}
        <Box sx={{ flexGrow: 1, p: 2, maxWidth: '1200px', mx: 'auto', width: '100%' }}>
          {/* 文档管理页面 */}
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* 文件上传区域 */}
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'text.primary', borderBottom: 1, pb: 2, borderColor: 'divider' }}>
                  <UploadIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
                  文档上传
                </Typography>
                
                <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="fileType-label">选择文件类型(自动识别)</InputLabel>
                    <Select
                      labelId="fileType-label"
                      id="fileTypeSelect"
                      value={selectedFileType || ''}
                      onChange={(e) => setSelectedFileType(e.target.value)}
                      label="选择文件类型(自动识别)"
                      sx={{ minWidth: 120 }}
                    >
                      {fileTypes.map(type => (
                        <MenuItem key={type.key} value={type.key}>{type.text}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {/* <Typography variant="subtitle1" gutterBottom>选择文档：</Typography> */}
                    <Button
                      variant="contained"
                      component="label"
                      sx={{
                        bgcolor: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                        py: 1.5,
                      }}
                    >
                      浏览文件
                      <input
                          ref={fileUploadRef}
                          type="file"
                          accept=".txt,.pdf,.doc,.docx"
                          onChange={handleFileChange}
                          multiple
                          hidden
                        />
                    </Button>
                    {(selectedFileSize || selectedFiles.length > 1) && (
                      <Box sx={{ mt: 1 }}>
                        {selectedFiles.length === 1 ? (
                          <Tooltip title="文件信息" arrow>
                            <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                              <InfoIcon fontSize="small" sx={{ mr: 1 }} />
                              文件名: {selectedFileName} | 文件大小: {selectedFileSize} MB
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Tooltip title="选中的文件列表" arrow>
                            <div>
                              <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                                <InfoIcon fontSize="small" sx={{ mr: 1 }} />
                                已选择 {selectedFiles.length} 个文件
                              </Typography>
                              <Box sx={{ maxHeight: '120px', overflowY: 'auto', mt: 1 }}>
                                {selectedFiles.map((file, index) => (
                                  <Typography key={index} variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>
                                    {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                                  </Typography>
                                ))}
                              </Box>
                            </div>
                          </Tooltip>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>

                {isUploading && (
                  <Box sx={{ mt: 3 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={uploadProgress} 
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                        },
                      }}
                    />
                    <Typography variant="body2" align="center" sx={{ mt: 1, color: 'text.secondary' }}>
                      {uploadProgress < 100 ? `上传中... ${uploadProgress}%` : '上传完成！'}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUploadFile}
                    disabled={isUploading || !fileUploadRef.current?.files?.length}
                    startIcon={<UploadIcon />}
                    sx={{
                      textTransform: 'none',
                      px: 4,
                      py: 1.2,
                      fontSize: '0.95rem',
                      boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.1)',
                      '&:hover': {
                        boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.12)',
                      },
                      '&.Mui-disabled': {
                        opacity: 0.6,
                      }
                    }}
                  >
                    {isUploading ? '上传中...' : '上传文档'}
                  </Button>
                </Box>
              </Paper>

              {/* 文档列表区域 */}
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'text.primary', borderBottom: 1, pb: 2, borderColor: 'divider' }}>
                  已上传文档
                </Typography>
                
                {documents.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    <Typography variant="body1">暂无上传的文档</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>请使用上方表单上传文档</Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 1, overflow: 'hidden' }}>
                    <Table sx={{ minWidth: 650 }} aria-label="documents table">
                      <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>文件名</TableCell>
                          <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>上传日期</TableCell>
                          <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>文件大小(MB)</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>操作</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {documents.map((doc, index) => (
                          <TableRow
                            key={doc.id || `doc-${index}`}
                            sx={{
                              '&:nth-of-type(even)': {
                                bgcolor: 'grey.50',
                              },
                              '&:hover': {
                                bgcolor: 'primary.light',
                              },
                              transition: 'background-color 0.2s'
                            }}
                          >
                            <TableCell component="th" scope="row">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <FileTextIcon fontSize="small" sx={{ mr: 2, color: 'primary.main' }} />
                                {doc.fileName}
                              </Box>
                            </TableCell>
                            <TableCell>
                              {new Date(doc.uploadDate).toLocaleString('zh-CN')}
                            </TableCell>
                            <TableCell>
                              {doc.fileSize ? (doc.fileSize / (1024 * 1024)).toFixed(2) : 'N/A'}
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="删除文档" arrow>
                                <IconButton
                                  onClick={() => handleDeleteDocument(doc.fileName)}
                                  color="error"
                                  size="small"
                                  sx={{
                                    '&:hover': {
                                      bgcolor: 'error.light',
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Box>
          )}

          {/* 知识库问答页面 */}
          {activeTab === 1 && (
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'text.primary', borderBottom: 1, pb: 2, borderColor: 'divider' }}>
                  <Book sx={{ mr: 2, verticalAlign: 'middle' }} />
                  知识库问答
                </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <TextField
                  fullWidth
                  label="输入您的问题"
                  multiline
                  rows={4}
                  variant="outlined"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="请输入关于知识库的问题..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'divider',
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                    '& .MuiInputBase-root': {
                      fontSize: '1rem',
                    },
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitQuestion}
                    disabled={!question.trim()}
                    startIcon={<SendIcon />}
                    sx={{
                      textTransform: 'none',
                      px: 4,
                      py: 1.2,
                      fontSize: '0.95rem',
                      boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.1)',
                      '&:hover': {
                        boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.12)',
                      }
                    }}
                  >
                    提交问题
                  </Button>
                </Box>

                {answer && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      答案：
                    </Typography>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 3,
                        bgcolor: 'primary.light',
                        borderRadius: 1,
                        borderLeft: '4px solid primary.main',
                      }}
                    >
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {answer}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Box>
            </Paper>
          )}
        </Box>

        {/* 底部页脚 */}
        <Box sx={{ bgcolor: 'grey.100', py: 3, mt: 4 }}>
          <Typography variant="body2" align="center" color="text.secondary">
            © {new Date().getFullYear()} 知识库管理系统 - 高效、智能的文档管理解决方案
          </Typography>
        </Box>
      </Box>

      {/* Snackbar提示组件 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: 1,
            boxShadow: 3,
          },
        }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%', fontWeight: 500, fontSize: '0.9rem' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        disableRestoreFocus={true}
        disableEnforceFocus={true}
        PaperProps={{
          style: {
            borderRadius: 8,
            boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 600 }}>确认删除</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            确定要删除文档 "{currentFileName}" 吗？此操作无法撤销。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
          <Button onClick={cancelDelete} sx={{ textTransform: 'none' }}>
            取消
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            确认删除
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default App;
