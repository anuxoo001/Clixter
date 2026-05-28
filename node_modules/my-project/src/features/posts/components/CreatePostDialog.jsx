import { Dialog, DialogContent, DialogTitle, Button } from '@mui/material';
import { Image as ImageIcon, Movie as MovieIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useEffect, useRef , useState } from 'react';
import { readFileAsDataURL } from '../../../utils/readFileAsDataURL';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios'
import { toast } from "sonner";
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '../postSlice';
import { useNavigate } from 'react-router-dom';




// const VisuallyHiddenInput = styled('input')({
//   clip: 'rect(0 0 0 0)',
//   clipPath: 'inset(50%)',
//   height: 1,
//   overflow: 'hidden',
//   position: 'absolute',
//   bottom: 0,
//   left: 0,
//   whiteSpace: 'nowrap',
//   width: 1,
// });

export default function CreatePostDialog({ open, handleClose }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const imageRef = useRef()
    const {posts} = useSelector(store=> store.post)
    const [file, setFile] = useState("")
    const [caption, setCaption] = useState("")
    const [imagePreview, setImagePreview] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const fileChangeHandler = async (e) => {
        const file = e.target.files[0]
        // console.log(file)
        if(file) {
            setFile(file)
            const imgUrl = await readFileAsDataURL(file)
            setImagePreview(imgUrl)
        }
    }

    useEffect(() => {
          setFile("")
          setCaption("")
          setIsLoading(false)
          setImagePreview("")
    } , [handleClose])

    const createPostHandler = async (e) => {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('caption' , caption)
      if (imagePreview) formData.append('media' , file)
      try {
        const api = import.meta.env.VITE_API || '';
        const res = await axios.post(`${api}/api/post/addpost`, formData, {
          headers:{
            "Content-Type" : 'multipart/form-data'
          },
          withCredentials: true
        })
        if (res.data.success) {
          toast.success(res.data.message)
          dispatch(setPosts([res.data.post , ...posts]))
          navigate("/")
        }
      } catch (error) {
        console.log(error)
      } finally {
          setFile("")
          setCaption("")
          setIsLoading(false)
          setImagePreview("")
          handleClose()
      }

    }
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            width: '50vw',
            // minHeight: '70vh',
            height: '70vh',
            backgroundColor: 'white',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column'
          }
        }
      }}
    >
      <DialogTitle className="text-center text-lg font-semibold bg-gray-200">
        Create new post
      </DialogTitle>

      <DialogContent
        className="flex flex-col items-center justify-center flex-1 gap-y-4 bg-white"
      >
        {/* <div className="text-gray-300 text-6xl flex">
          <ImageIcon style={{ fontSize: 60 }} />
          <MovieIcon style={{ fontSize: 60, marginLeft: -20 }} />
        </div> */}
        {!imagePreview ? 
          <div className="text-gray-300 text-6xl flex">
            <ImageIcon style={{ fontSize: 60 }} />
            <MovieIcon style={{ fontSize: 60, marginLeft: -20 }} />
          </div> 
          : 
          <div className="flex-1 flex flex-col gap-y-2">
            <div className="relative  bg-red-100 w-full overflow-hidden rounded-lg flex items-center justify-center h-[300px]">
                <img
                  className="max-h-full max-w-full object-contain"
                  src={imagePreview}
                  alt="preview_image"
                />
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Write a caption..."
              rows="3"
            />
          </div>

        }
        <input ref={imageRef} type="file" className=' hidden' onChange={fileChangeHandler} />
        <Button
          onClick={() => imageRef.current.click()}
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
        >
          Upload files
        </Button>
        {imagePreview && (
          isLoading ? 
          <Button loading loadingPosition="start" startIcon={<SaveIcon />}>Posting...</Button>
          :
          <Button onClick={createPostHandler} className='w-full bg-slate-900 hover:bg-blue-200/50'>Post</Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
