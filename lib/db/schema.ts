import { pgTable, text, uuid, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  size: integer("size").notNull(),
  type: text("type").notNull(),

  // Storage

  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),

  //Ownership

  userId: text("user_id").notNull(),
  parentId: uuid("parent_id"), // Parent folder id (if any and null for root items)

  // file and folder

  isFolder: boolean("is_folder").default(false).notNull(),
  isStarred: boolean("is_starred").default(false).notNull(),
  isTrash: boolean("is_trash").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(), 
});

/* 

 =======ONE TO MANY RELATIONSHIP======

parent: Each file/folder can have one parent folder i.e root folder
child: Each folder can have many child folders/files

*/

export const fileRelations = relations(files, ({one, many}) => ({
    parent: one(files, {
        fields: [files.parentId],
        references: [files.id],
    }),
    // relatiionship to child file/folder
    children: many(files)
}))


// Type definition

export const Files = typeof files.$inferSelect;
export const newFile = typeof files.$inferInsert;