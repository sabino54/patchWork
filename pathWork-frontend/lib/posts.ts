import { supabase } from "./supabase";

export interface Post {
    id: string;
    created_at: string;
    media_url: string;
    media_type: string;
    description: string;
    user_id: string;
    title: string;
    tags: string[];
    project: string;
    version: number;
}

function transformPost(data: any): Post {

    return {
        id: data.id,
        created_at: data.created_at,
        media_url: data.media_url,
        media_type: data.media_type,
        description: data.description,
        user_id: data.user_id,
        title: data.title,
        tags: data.tags,
        project: data.project,
        version: data.version,
    }

}


export async function getPosts(): Promise<Post[]> {
    const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching posts:", error);
        throw error;
    }

    return (data || []).map(transformPost);
}

