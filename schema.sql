-- CreateTable
CREATE TABLE "canyon_user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "favor" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canyon_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canyon_doc" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_folder" BOOLEAN NOT NULL DEFAULT false,
    "parent_id" TEXT,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canyon_doc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "canyon_doc_owner_id_idx" ON "canyon_doc"("owner_id");

-- CreateIndex
CREATE INDEX "canyon_doc_parent_id_idx" ON "canyon_doc"("parent_id");

-- AddForeignKey
ALTER TABLE "canyon_doc" ADD CONSTRAINT "canyon_doc_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "canyon_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

