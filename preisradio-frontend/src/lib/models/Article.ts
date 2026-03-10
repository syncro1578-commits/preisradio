import mongoose, { Schema, Document } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  amazonKeywords: string[];
  status: 'draft' | 'published';
  author: string;
  readTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true, default: 'Kaufberatung' },
    image: { type: String, default: '' },
    amazonKeywords: { type: [String], default: [] },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    author: { type: String, default: 'Preisradio Redaktion' },
    readTime: { type: Number, default: 5 },
  },
  {
    timestamps: true,
    collection: 'Db',
  }
);

// Generate slug from title
ArticleSchema.pre('validate', function () {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[äÄ]/g, 'ae')
      .replace(/[öÖ]/g, 'oe')
      .replace(/[üÜ]/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
});

export default mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);
