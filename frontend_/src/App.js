
import React, {useState, useEffect} from 'react'

function App(){
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [commentAuthor, setCommentAuthor] = useState('')
  const [commentBody, setCommentBody] = useState('')
  const [comments, setComments] = useState([])
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [editingTaskId, setEditingTaskId] = useState(null)
  // For comment editing
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentAuthor, setEditingCommentAuthor] = useState('')
  const [editingCommentBody, setEditingCommentBody] = useState('')

  useEffect(()=>{
    fetch('/tasks').then(r=>r.json()).then(setTasks)
  },[])

  useEffect(()=>{
    if(selectedTask){
      fetch(`/tasks/${selectedTask.id}/comments`).then(r=>r.json()).then(setComments)
    } else {
      setComments([])
    }
  },[selectedTask])

  function selectTask(task){
    setSelectedTask(task)
    setEditingTaskId(null)
  }

  function startEditTask(task){
    setEditingTaskId(task.id)
    setTaskTitle(task.title)
    setTaskDescription(task.description || '')
  }

  function cancelEdit(){
    setEditingTaskId(null)
    setTaskTitle('')
    setTaskDescription('')
  }

  function submitComment(e){
    e.preventDefault()
    if(!selectedTask) return
    if(editingCommentId){
      // Update comment
      fetch(`/comments/${editingCommentId}`,{
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({author: editingCommentAuthor, body: editingCommentBody})
      }).then(r=>r.json()).then(()=>{
        setEditingCommentId(null)
        setEditingCommentAuthor('')
        setEditingCommentBody('')
        fetch(`/tasks/${selectedTask.id}/comments`).then(r=>r.json()).then(setComments)
      })
    } else {
      // Create comment
      fetch(`/tasks/${selectedTask.id}/comments`,{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({author: commentAuthor, body: commentBody})
      }).then(r=>r.json()).then(()=>{
        setCommentAuthor('')
        setCommentBody('')
        fetch(`/tasks/${selectedTask.id}/comments`).then(r=>r.json()).then(setComments)
      })
    }
  }

  function startEditComment(comment){
    setEditingCommentId(comment.id)
    setEditingCommentAuthor(comment.author)
    setEditingCommentBody(comment.body)
  }

  function cancelEditComment(){
    setEditingCommentId(null)
    setEditingCommentAuthor('')
    setEditingCommentBody('')
  }

  function deleteComment(comment){
    if(!window.confirm('Delete this comment?')) return
    fetch(`/comments/${comment.id}`,{method:'DELETE'}).then(r=>r.json()).then(()=>{
      fetch(`/tasks/${selectedTask.id}/comments`).then(r=>r.json()).then(setComments)
    })
  }

  function createOrUpdateTask(e){
    e.preventDefault()
    if(editingTaskId){
      fetch(`/tasks/${editingTaskId}`,{
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title: taskTitle, description: taskDescription})
      }).then(r=>r.json()).then(updated=>{
        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
        setEditingTaskId(null)
        setTaskTitle('')
        setTaskDescription('')
        if(selectedTask && selectedTask.id === updated.id) setSelectedTask(updated)
      })
    } else {
      fetch('/tasks',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title: taskTitle, description: taskDescription})
      }).then(r=>r.json()).then(created=>{
        setTasks(prev => [created, ...prev])
        setTaskTitle('')
        setTaskDescription('')
      })
    }
  }

  function deleteTask(task){
    if(!confirm(`Delete task "${task.title}"?`)) return
    fetch(`/tasks/${task.id}`,{method: 'DELETE'}).then(r=>r.json()).then(()=>{
      setTasks(prev => prev.filter(t => t.id !== task.id))
      if(selectedTask && selectedTask.id === task.id) setSelectedTask(null)
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f0f4f8 0%, #e9f0fb 100%)',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      color: '#222',
      padding: 0, margin: 0
    }}>
      <div style={{maxWidth: 1100, margin: '0 auto', padding: 32}}>
        <h1 style={{letterSpacing:1, fontWeight:700, color:'#2a4d7a', marginBottom: 24}}>Task Manager</h1>
        <div style={{display:'flex',gap:32, alignItems:'flex-start'}}>
          {/* Task List & Form */}
          <div style={{width:370, background:'#fff', borderRadius:10, boxShadow:'0 2px 12px #0001', padding:24}}>
            <h2 style={{marginTop:0, color:'#2a4d7a'}}>Tasks</h2>
            <form onSubmit={createOrUpdateTask} style={{marginBottom:20, background:'#f6fafd', padding:14, borderRadius:8, boxShadow:'0 1px 4px #0001'}}>
              <input required placeholder="Title" value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} style={{width:'100%',marginBottom:8,padding:8,borderRadius:4,border:'1px solid #bcd'}} />
              <textarea placeholder="Description" value={taskDescription} onChange={e=>setTaskDescription(e.target.value)} style={{width:'100%',marginBottom:8,padding:8,borderRadius:4,border:'1px solid #bcd',resize:'vertical',minHeight:40}} />
              <div>
                <button type="submit" style={{background:'#2a4d7a',color:'#fff',border:'none',padding:'7px 18px',borderRadius:4,cursor:'pointer',fontWeight:600}}>{editingTaskId ? 'Update Task' : 'Add Task'}</button>
                {editingTaskId && <button type="button" onClick={cancelEdit} style={{marginLeft:8,background:'#eee',border:'none',padding:'7px 18px',borderRadius:4,cursor:'pointer'}}>Cancel</button>}
              </div>
            </form>
            <div style={{maxHeight: '60vh', overflowY: 'auto'}}>
              {tasks.length === 0 && <div style={{color:'#888',fontSize:15}}>No tasks yet.</div>}
              {tasks.map(t => (
                <div key={t.id} style={{
                  padding:12,
                  border:'1px solid #e3e8f0',
                  marginBottom:10,
                  background:selectedTask&&selectedTask.id===t.id?'#e6f7ff':'#fafdff',
                  borderRadius:7,
                  boxShadow:selectedTask&&selectedTask.id===t.id?'0 2px 8px #2a4d7a22':'none',
                  transition:'box-shadow 0.2s, background 0.2s'
                }}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div style={{cursor:'pointer'}} onClick={()=>selectTask(t)}>
                      <strong style={{fontSize:17}}>{t.title}</strong>
                      <div style={{fontSize:13,color:'#666',marginTop:2}}>{t.description}</div>
                    </div>
                    <div>
                      <button onClick={()=>startEditTask(t)} style={{marginRight:4,background:'#f0f4f8',border:'none',padding:'5px 10px',borderRadius:4,cursor:'pointer'}}>Edit</button>
                      <button onClick={()=>deleteTask(t)} style={{color:'#fff',background:'#e74c3c',border:'none',padding:'5px 10px',borderRadius:4,cursor:'pointer'}}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <div style={{flex:1, background:'#fff', borderRadius:10, boxShadow:'0 2px 12px #0001', padding:24, minHeight:400}}>
            {selectedTask ? (
              <div>
                <h2 style={{marginTop:0, color:'#2a4d7a'}}>{selectedTask.title}</h2>
                <div style={{marginBottom:18, color:'#444'}}>{selectedTask.description}</div>
                <h3 style={{margin:'18px 0 10px 0', color:'#2a4d7a'}}>Comments</h3>
                <ul style={{listStyle:'none',padding:0,margin:0}}>
                  {comments.map(c => (
                    <li key={c.id} style={{borderBottom:'1px solid #f0f0f0',padding:'10px 0',marginBottom:2}}>
                      {editingCommentId===c.id ? (
                        <form onSubmit={submitComment} style={{marginBottom:4,display:'flex',flexDirection:'column',gap:6,background:'#f9f9f9',padding:10,borderRadius:6}}>
                          <input required placeholder="Author" value={editingCommentAuthor} onChange={e=>setEditingCommentAuthor(e.target.value)} style={{padding:7,borderRadius:4,border:'1px solid #bcd'}} autoFocus />
                          <textarea required placeholder="Comment" value={editingCommentBody} onChange={e=>setEditingCommentBody(e.target.value)} style={{padding:7,borderRadius:4,border:'1px solid #bcd',resize:'vertical',minHeight:36}} />
                          <div>
                            <button type="submit" style={{background:'#2a4d7a',color:'#fff',border:'none',padding:'6px 16px',borderRadius:4,cursor:'pointer',fontWeight:600}}>Save</button>
                            <button type="button" onClick={cancelEditComment} style={{marginLeft:8,background:'#eee',border:'none',padding:'6px 16px',borderRadius:4,cursor:'pointer'}}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <div>
                            <div style={{fontWeight:'bold',fontSize:15}}>{c.author} <span style={{fontWeight:'normal',fontSize:12,color:'#888'}}>{new Date(c.created_at).toLocaleString()}</span></div>
                            <div style={{marginTop:2}}>{c.body}</div>
                          </div>
                          <div>
                            <button onClick={()=>startEditComment(c)} style={{marginRight:4,background:'#f0f4f8',border:'none',padding:'5px 10px',borderRadius:4,cursor:'pointer'}}>Edit</button>
                            <button onClick={()=>deleteComment(c)} style={{color:'#fff',background:'#e74c3c',border:'none',padding:'5px 10px',borderRadius:4,cursor:'pointer'}}>Delete</button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                {/* Only show add comment form if not editing */}
                {!editingCommentId && (
                  <form onSubmit={submitComment} style={{marginTop:18,background:'#f6fafd',padding:14,borderRadius:8,boxShadow:'0 1px 4px #0001',display:'flex',flexDirection:'column',gap:8}}>
                    <input required placeholder="Author" value={commentAuthor} onChange={e=>setCommentAuthor(e.target.value)} style={{padding:8,borderRadius:4,border:'1px solid #bcd'}} autoFocus />
                    <textarea required placeholder="Comment" value={commentBody} onChange={e=>setCommentBody(e.target.value)} style={{padding:8,borderRadius:4,border:'1px solid #bcd',resize:'vertical',minHeight:40}} />
                    <button type="submit" style={{background:'#2a4d7a',color:'#fff',border:'none',padding:'7px 18px',borderRadius:4,cursor:'pointer',fontWeight:600}}>Add Comment</button>
                  </form>
                )}
              </div>
            ) : (
              <div style={{color:'#888',fontSize:17,marginTop:40}}>Select a task to view/add comments</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
