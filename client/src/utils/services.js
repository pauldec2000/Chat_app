export const BASE_URL = "https://chat-app-m71j.onrender.com/api";

export const POST_REQUEST = async (url, body) => {
   
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            let message = data?.message || data;
            return { error: true, message };
        }
        
        return data;
    } catch (error) {
        console.error('Request failed', error);
        return { error: true, message: error.message };
    }
};


export const GET_REQUEST=async(url)=>{
    const response=await fetch(url)

    const data=await response.json()

    if(!response.ok){
        let message="An Error Occured.."
        if(data?.message){
            message=data.message
        }
        return {error:true,message}
    }

    return data

}
